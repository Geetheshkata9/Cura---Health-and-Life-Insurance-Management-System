import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Calendar, DollarSign, FileText, UploadCloud, ChevronRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '../components/ThemeToggle';

// Form validation schema using Zod
const claimSchema = z.object({
  userPolicyId: z.string().min(1, 'Please select an active policy'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  claimAmount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Claim amount is required' })
      .positive('Claim amount must be a positive number')
  ),
  reason: z.string()
    .min(10, 'Please describe the incident in at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
});

const CustomerClaimSubmission = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Wizard steps: 1 = Policy Select, 2 = Incident details, 3 = Amount & Proof, 4 = Review
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(claimSchema),
    mode: 'onChange',
    defaultValues: {
      userPolicyId: '',
      incidentDate: '',
      claimAmount: '',
      reason: '',
    }
  });

  const watchedPolicyId = watch('userPolicyId');
  const watchedAmount = watch('claimAmount');
  const watchedReason = watch('reason');
  const watchedDate = watch('incidentDate');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await api.get('/user-policies/my');
        // Only active/claimed policies can support claims (usually active)
        const activePolicies = res.data.filter(p => p.status === 'active');
        setPolicies(activePolicies);
        if (activePolicies.length > 0) {
          setValue('userPolicyId', activePolicies[0]._id);
        }
      } catch (err) {
        console.error('Error fetching policies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, [setValue]);

  // Sync selected policy detail block
  useEffect(() => {
    if (watchedPolicyId) {
      const found = policies.find(p => p._id === watchedPolicyId);
      setSelectedPolicy(found);
    }
  }, [watchedPolicyId, policies]);

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['userPolicyId'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['incidentDate', 'reason'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['claimAmount'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    // Additional custom verification: claimAmount cannot exceed policy coverageAmount
    if (currentStep === 3 && isValid && selectedPolicy) {
      const amount = Number(watchedAmount);
      const limit = selectedPolicy.policyRef?.coverageAmount || 0;
      if (amount > limit) {
        setServerError(`Claim amount cannot exceed policy coverage limit of $${limit.toLocaleString()}`);
        return;
      }
    }

    if (isValid) {
      setServerError(null);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setServerError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('userPolicyId', data.userPolicyId);
    formData.append('claimAmount', data.claimAmount);
    formData.append('reason', data.reason);
    formData.append('incidentDate', data.incidentDate);
    
    files.forEach((file) => {
      formData.append('documents', file);
    });

    try {
      await api.post('/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Redirect back to dashboard upon success
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/customer/dashboard" className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-primary font-bold transition-colors">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-muted-foreground mr-1">File an Outpatient Claim</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
          {/* Progress Indicator */}
          <Card className="border border-border p-6 shadow-sm bg-card">
            <div className="flex items-center justify-between">
              {[
                { step: 1, name: 'Policy' },
                { step: 2, name: 'Incident' },
                { step: 3, name: 'Details' },
                { step: 4, name: 'Review' },
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex flex-col items-center space-y-1.5 flex-1 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep > s.step ? 'bg-primary text-primary-foreground' :
                      currentStep === s.step ? 'bg-primary/10 text-primary ring-2 ring-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {currentStep > s.step ? <Check size={14} /> : s.step}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      currentStep >= s.step ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{s.name}</span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-0.5 flex-1 transition-colors ${
                      currentStep > s.step ? 'bg-primary' : 'bg-border'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* Form Card */}
          <Card className="border border-border p-6 sm:p-8 shadow-md bg-card rounded-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {serverError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-xs font-semibold text-destructive">
                  {serverError}
                </div>
              )}

              {/* STEP 1: Select Policy */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
                      <ShieldCheck className="text-primary" />
                      <span>Select Covered Policy</span>
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Choose which active policy you are filing a claim against. Only active policies are eligible.
                    </p>
                  </div>

                  {policies.length === 0 ? (
                    <div className="p-6 bg-muted/30 border border-border border-dashed rounded-2xl text-center text-muted-foreground text-sm">
                      No active policies found. You cannot file a claim.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <select
                        {...register('userPolicyId')}
                        className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {policies.map((p) => (
                          <option key={p._id} value={p._id} className="bg-card text-foreground">
                            {p.policyRef?.title}
                          </option>
                        ))}
                      </select>
                      {errors.userPolicyId && (
                        <p className="text-destructive text-xs font-semibold">{errors.userPolicyId.message}</p>
                      )}

                      {/* Policy Specs Display */}
                      {selectedPolicy && (
                        <div className="bg-muted/40 border border-border/60 rounded-2xl p-5 space-y-4">
                          <h3 className="font-bold text-foreground text-sm">Policy Specifications</h3>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Coverage Type</p>
                              <p className="font-semibold text-foreground capitalize">{selectedPolicy.policyRef?.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Policy Term</p>
                              <p className="font-semibold text-foreground">{selectedPolicy.policyRef?.termYears} Years</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Coverage Limit</p>
                              <p className="font-bold text-foreground text-sm">${selectedPolicy.policyRef?.coverageAmount?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Purchased On</p>
                              <p className="font-semibold text-foreground">{new Date(selectedPolicy.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {selectedPolicy.policyRef?.benefits?.length > 0 && (
                            <div className="pt-3 border-t border-border">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Covered Benefits</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedPolicy.policyRef.benefits.map((b, idx) => (
                                  <span key={idx} className="bg-card border border-border text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Incident Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
                      <Calendar className="text-primary" />
                      <span>Incident Details</span>
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Provide details about the incident date and a thorough explanation of what happened.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="incidentDate">Date of Incident</Label>
                      <Input
                        id="incidentDate"
                        type="date"
                        {...register('incidentDate')}
                      />
                      {errors.incidentDate && (
                        <p className="text-destructive text-xs font-semibold">{errors.incidentDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reason">Description of Incident</Label>
                      <Textarea
                        id="reason"
                        rows="5"
                        placeholder="Provide details of outpatient visits, symptoms, hospital stays, etc."
                        {...register('reason')}
                      />
                      {errors.reason && (
                        <p className="text-destructive text-xs font-semibold">{errors.reason.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Claim Amount & Proof Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
                      <DollarSign className="text-primary" />
                      <span>Compensation & Proof Documents</span>
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Enter the total claim amount requested and upload supporting receipts or medical reports.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="claimAmount">Requested Compensation Amount ($)</Label>
                      <Input
                        id="claimAmount"
                        type="number"
                        placeholder="e.g. 1500"
                        {...register('claimAmount')}
                      />
                      {errors.claimAmount && (
                        <p className="text-destructive text-xs font-semibold">{errors.claimAmount.message}</p>
                      )}
                      {selectedPolicy && (
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Max available coverage: ${selectedPolicy.policyRef?.coverageAmount?.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Proof / Receipts Upload</Label>
                      <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 transition-colors relative cursor-pointer flex flex-col items-center justify-center space-y-2 bg-muted/10">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="text-muted-foreground" size={32} />
                        <span className="text-sm font-bold text-foreground">
                          {files.length > 0 ? `${files.length} file(s) selected` : 'Drag & drop files or click to browse'}
                        </span>
                        <span className="text-xs text-muted-foreground">PDF, JPG, JPEG, PNG up to 5 documents</span>
                      </div>
                      {files.length > 0 && (
                        <div className="pt-2 space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block">Selected files:</span>
                          <ul className="divide-y divide-border text-xs text-foreground font-semibold bg-muted/30 border border-border rounded-xl px-4 py-2">
                            {files.map((file, idx) => (
                              <li key={idx} className="py-1.5 flex items-center justify-between">
                                <span className="truncate max-w-xs">{file.name}</span>
                                <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review Details */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
                      <FileText className="text-primary" />
                      <span>Review Claim Summary</span>
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Double check all details. Once submitted, your claim status will be flagged as pending.
                    </p>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground font-semibold">Policy Name</span>
                      <span className="font-bold text-foreground text-right">{selectedPolicy?.policyRef?.title}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground font-semibold">Incident Date</span>
                      <span className="font-bold text-foreground">{new Date(watchedDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground font-semibold">Amount Requested</span>
                      <span className="font-extrabold text-primary">${Number(watchedAmount).toLocaleString()}</span>
                    </div>

                    <div className="space-y-1.5 py-2">
                      <span className="text-muted-foreground font-semibold block">Description / Reason</span>
                      <p className="text-foreground bg-card border border-border rounded-xl p-3.5 text-xs leading-relaxed max-h-40 overflow-y-auto">
                        {watchedReason}
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="py-2">
                        <span className="text-muted-foreground font-semibold block mb-1.5">Attached Evidence ({files.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {files.map((file, idx) => (
                            <span key={idx} className="bg-card border border-border text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-xs">
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="py-4 px-6 text-xs font-semibold"
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="py-4 px-6 text-xs font-semibold flex items-center"
                  >
                    <span>Next Step</span>
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-xs"
                  >
                    {submitLoading ? 'Submitting Claim...' : 'Confirm & Submit Claim'}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </main>
      )}
    </div>
  );
};

export default CustomerClaimSubmission;
