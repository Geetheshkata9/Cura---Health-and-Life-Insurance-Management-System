import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, ShieldAlert, LogOut, FileText, ClipboardList, CheckCircle2, 
  XCircle, ArrowRight, Eye, RefreshCw, X, FolderOpen, Calendar, Shield,
  TrendingUp, DollarSign, Users, Printer, PieChart, BarChart3, Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '../components/ThemeToggle';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'policies' | 'analytics'

  // Data states
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [claimFilter, setClaimFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Analytics Specific States
  const [userPolicies, setUserPolicies] = useState([]);
  const [allClaimsForStats, setAllClaimsForStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Policy Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('health');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [premium, setPremium] = useState('');
  const [termYears, setTermYears] = useState('');
  const [benefits, setBenefits] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [waitingPeriodDays, setWaitingPeriodDays] = useState('');
  const [roomRentLimit, setRoomRentLimit] = useState('');
  const [familySizeLimit, setFamilySizeLimit] = useState('');
  const [premiumFrequency, setPremiumFrequency] = useState('Monthly');
  
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyMessage, setPolicyMessage] = useState(null);

  // Expandable Drawer State for Claim Details Review
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState('approved');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [claimFilter, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const claimsUrl = claimFilter ? `/claims?status=${claimFilter}` : '/claims';
      
      // Fetch stats in parallel for analytics
      const [policiesRes, claimsRes, allClaimsRes, userPoliciesRes] = await Promise.all([
        api.get('/policies'),
        api.get(claimsUrl),
        api.get('/claims'),
        api.get('/user-policies')
      ]);
      
      setPolicies(policiesRes.data);
      setClaims(claimsRes.data);
      setAllClaimsForStats(allClaimsRes.data);
      setUserPolicies(userPoliciesRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!title || !coverageAmount || !premium || !termYears) {
      setPolicyMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setPolicyLoading(true);
    setPolicyMessage(null);

    const benefitsArray = benefits.split(',').map((b) => b.trim()).filter((b) => b);

    try {
      const res = await api.post('/policies', {
        title,
        type,
        coverageAmount: Number(coverageAmount),
        premium: Number(premium),
        termYears: Number(termYears),
        benefits: benefitsArray,
        eligibility,
        waitingPeriodDays: waitingPeriodDays ? Number(waitingPeriodDays) : undefined,
        roomRentLimit: roomRentLimit ? Number(roomRentLimit) : undefined,
        familySizeLimit: familySizeLimit ? Number(familySizeLimit) : undefined,
        premiumFrequency: type === 'life' ? premiumFrequency : undefined,
      });

      setPolicyMessage({ type: 'success', text: 'Policy created successfully!' });
      setPolicies([res.data, ...policies]);
      
      // Reset Form
      setTitle('');
      setType('health');
      setCoverageAmount('');
      setPremium('');
      setTermYears('');
      setBenefits('');
      setEligibility('');
      setWaitingPeriodDays('');
      setRoomRentLimit('');
      setFamilySizeLimit('');
      setPremiumFrequency('Monthly');
    } catch (err) {
      setPolicyMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create policy.' });
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/policies/${policyId}`);
      setPolicies(policies.filter((p) => p._id !== policyId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete policy.');
    }
  };

  const openReviewDrawer = (claim) => {
    setSelectedClaim(claim);
    setDecisionStatus(claim.status === 'pending' || claim.status === 'under_review' ? 'approved' : claim.status);
    setAdminRemarks(claim.adminRemarks || '');
    setDrawerOpen(true);
  };

  const closeReviewDrawer = () => {
    setDrawerOpen(false);
    setSelectedClaim(null);
  };

  const handleUpdateClaimStatus = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/claims/${selectedClaim._id}/status`, {
        status: decisionStatus,
        adminRemarks,
      });
      // Update local state lists
      setClaims(claims.map((c) => (c._id === selectedClaim._id ? res.data : c)));
      setAllClaimsForStats(allClaimsForStats.map((c) => (c._id === selectedClaim._id ? res.data : c)));
      closeReviewDrawer();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim status.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // GLOBAL ANALYTICS METRIC CALCULATIONS
  // ==========================================
  const totalPoliciesCount = userPolicies.length;
  
  // Total Premium income collected (all time)
  const totalPremiumRevenue = userPolicies.reduce((acc, up) => acc + (up.policyRef?.premium || 0), 0);
  
  // Total Claims submitted
  const totalClaimsCount = allClaimsForStats.length;
  
  // Total payout approved (approved claims)
  const totalApprovedPayout = allClaimsForStats
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => acc + (c.claimAmount || 0), 0);

  // Loss Ratio: (Claim Payouts / Premium Revenue) * 100
  const lossRatio = totalPremiumRevenue > 0 ? (totalApprovedPayout / totalPremiumRevenue) * 100 : 0;

  // Resolution Rate: ((Approved + Rejected Claims) / Total Claims) * 100
  const resolvedClaims = allClaimsForStats.filter(c => ['approved', 'rejected'].includes(c.status)).length;
  const resolutionRate = totalClaimsCount > 0 ? (resolvedClaims / totalClaimsCount) * 100 : 0;

  // Policies Type Breakdown
  const healthPoliciesCount = userPolicies.filter(up => up.policyRef?.type === 'health').length;
  const lifePoliciesCount = userPolicies.filter(up => up.policyRef?.type === 'life').length;

  // Claims Status Breakdown
  const pendingClaimsCount = allClaimsForStats.filter(c => c.status === 'pending').length;
  const reviewClaimsCount = allClaimsForStats.filter(c => c.status === 'under_review').length;
  const approvedClaimsCount = allClaimsForStats.filter(c => c.status === 'approved').length;
  const rejectedClaimsCount = allClaimsForStats.filter(c => c.status === 'rejected').length;

  // ==========================================
  // MONTHLY REPORT FILTERING & CALCULATIONS
  // ==========================================
  const monthlyPolicies = userPolicies.filter(up => {
    const d = new Date(up.createdAt);
    return d.getMonth() === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
  });

  const monthlyClaims = allClaimsForStats.filter(c => {
    const d = new Date(c.createdAt);
    return d.getMonth() === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
  });

  const monthlyPremiumCollected = monthlyPolicies.reduce((acc, up) => acc + (up.policyRef?.premium || 0), 0);
  
  const monthlyClaimPayout = monthlyClaims
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => acc + (c.claimAmount || 0), 0);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-45 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
              <Shield size={18} />
            </span>
            <span className="text-xl font-black text-foreground tracking-tight">Cura</span>
            <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
              Staff Portal
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground text-sm font-semibold">Welcome, {user?.name} ({user?.role})</span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs font-semibold hover:text-red-500 hover:border-red-200"
            >
              <LogOut size={13} className="mr-1.5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Management Dashboard</h1>
              <p className="mt-1 text-slate-300 text-xs max-w-xl">
                Assess user claims, configure policy catalogs, and evaluate performance analytics reports.
              </p>
            </div>
            
            {/* Tab Toggles */}
            <div className="bg-slate-700/50 p-1.5 rounded-xl flex flex-wrap gap-1 border border-slate-700">
              <Button
                variant={activeTab === 'claims' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setActiveTab('claims'); setClaimFilter(''); }}
                className={`text-xs font-semibold rounded-lg py-4 transition-all ${
                  activeTab === 'claims' ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm' : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                Claims Board
              </Button>
              <Button
                variant={activeTab === 'policies' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('policies')}
                className={`text-xs font-semibold rounded-lg py-4 transition-all ${
                  activeTab === 'policies' ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm' : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                Insurance Policies
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
                className={`text-xs font-semibold rounded-lg py-4 transition-all ${
                  activeTab === 'analytics' ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm' : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                Analytics & Reports
              </Button>
            </div>
          </div>

          {/* TAB 1: Claims Review Board */}
          {activeTab === 'claims' && (
            <Card className="bg-card border border-border shadow-sm p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2.5">
                  <span className="bg-primary/10 text-primary p-2 rounded-xl"><ClipboardList size={18} /></span>
                  <h2 className="text-lg font-bold text-foreground">Claims Processing Queue</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Filter:</span>
                  <select
                    value={claimFilter}
                    onChange={(e) => setClaimFilter(e.target.value)}
                    className="flex h-8 rounded-lg border border-input bg-card px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="" className="bg-card text-foreground">All Claims</option>
                    <option value="pending" className="bg-card text-foreground">Pending</option>
                    <option value="under_review" className="bg-card text-foreground">Under Review</option>
                    <option value="approved" className="bg-card text-foreground">Approved</option>
                    <option value="rejected" className="bg-card text-foreground">Rejected</option>
                  </select>
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No claims found matching this status filter.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Policy Name</TableHead>
                      <TableHead className="font-semibold">Claimant</TableHead>
                      <TableHead className="font-semibold">Date Filed</TableHead>
                      <TableHead className="font-semibold">Incident Date</TableHead>
                      <TableHead className="font-semibold">Requested</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c._id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground">{c.userPolicyRef?.policyRef?.title || 'Policy'}</TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-foreground">{c.userRef?.name}</div>
                          <div className="text-xs text-muted-foreground">{c.userRef?.email}</div>
                        </TableCell>
                        <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(c.incidentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold text-foreground">${c.claimAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            c.status === 'approved' ? 'bg-green-50 text-green-700' :
                            c.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            c.status === 'under_review' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewDrawer(c)}
                            className="text-xs font-semibold"
                          >
                            <Eye size={12} className="mr-1" />
                            <span>Review</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 2: Insurance Policies CRUD */}
          {activeTab === 'policies' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left/Middle: Policies List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card border border-border shadow-sm p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-border pb-4">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><FileText size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Policies Database</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((p) => (
                      <Card key={p._id} className="border border-border/80 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden bg-card flex flex-col justify-between">
                        <div>
                          <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-3 ${p.type === 'health' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                            {p.type}
                          </span>
                          <h3 className="font-bold text-foreground text-sm mb-1">{p.title}</h3>
                          <p className="text-muted-foreground text-xs mb-3">Duration: {p.termYears} Years</p>

                          {/* Extra attributes summary */}
                          {(p.waitingPeriodDays || p.roomRentLimit || p.familySizeLimit || p.premiumFrequency) && (
                            <div className="space-y-1 text-[10px] text-muted-foreground mb-3 pb-3 border-b border-border/40">
                              {p.waitingPeriodDays && <div>• Waiting Period: <span className="font-semibold text-foreground">{p.waitingPeriodDays} Days</span></div>}
                              {p.roomRentLimit && <div>• Room Rent Limit: <span className="font-semibold text-foreground">${p.roomRentLimit}/day</span></div>}
                              {p.familySizeLimit && <div>• Family Size Limit: <span className="font-semibold text-foreground">{p.familySizeLimit} Members</span></div>}
                              {p.premiumFrequency && <div>• Premium Mode: <span className="font-semibold text-foreground">{p.premiumFrequency}</span></div>}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-xs pt-3 border-t border-border/60 mb-4">
                            <div>
                              <p className="text-muted-foreground">{p.premiumFrequency || 'Monthly'} Premium</p>
                              <p className="font-bold text-foreground">${p.premium}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">
                                {p.type === 'life' 
                                  ? 'Death Benefit' 
                                  : p.familySizeLimit 
                                    ? 'Total Sum Insured' 
                                    : 'Sum Insured'}
                              </p>
                              <p className="font-bold text-foreground">${p.coverageAmount?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          onClick={() => handleDeletePolicy(p._id)}
                          className="w-full text-center text-xs font-semibold py-2 rounded-lg"
                        >
                          Remove Policy
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right: Policy Creation Form */}
              <div>
                <Card className="bg-card border border-border p-6 shadow-sm rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2.5">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><Plus size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Add New Policy</h2>
                  </div>

                  <form onSubmit={handleCreatePolicy} className="space-y-4">
                    {policyMessage && (
                      <div className={`p-3 rounded-lg text-xs font-semibold ${policyMessage.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                        {policyMessage.text}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="policyTitle">Policy Title</Label>
                      <Input
                        id="policyTitle"
                        type="text"
                        placeholder="e.g. Health Shield Basic"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="policyType">Type</Label>
                        <select
                          id="policyType"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="health" className="bg-card text-foreground">Health</option>
                          <option value="life" className="bg-card text-foreground">Life</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="policyTerm">Term (Years)</Label>
                        <Input
                          id="policyTerm"
                          type="number"
                          placeholder="e.g. 5"
                          value={termYears}
                          onChange={(e) => setTermYears(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="policyPremium">Premium ($)</Label>
                        <Input
                          id="policyPremium"
                          type="number"
                          placeholder="e.g. 150"
                          value={premium}
                          onChange={(e) => setPremium(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="policyCoverage">Coverage ($)</Label>
                        <Input
                          id="policyCoverage"
                          type="number"
                          placeholder="e.g. 500000"
                          value={coverageAmount}
                          onChange={(e) => setCoverageAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="policyBenefits">Benefits (Comma Separated)</Label>
                      <Input
                        id="policyBenefits"
                        type="text"
                        placeholder="e.g. Dental Care, Eye Checkup"
                        value={benefits}
                        onChange={(e) => setBenefits(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="policyEligibility">Eligibility Requirements</Label>
                      <Input
                        id="policyEligibility"
                        type="text"
                        placeholder="e.g. Age 18-65, Non-smoker"
                        value={eligibility}
                        onChange={(e) => setEligibility(e.target.value)}
                      />
                    </div>

                    {type === 'health' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="policyWaitingPeriod">Waiting Period (Days)</Label>
                            <Input
                              id="policyWaitingPeriod"
                              type="number"
                              placeholder="e.g. 30"
                              value={waitingPeriodDays}
                              onChange={(e) => setWaitingPeriodDays(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="policyRoomRent">Room Rent Limit ($/day)</Label>
                            <Input
                              id="policyRoomRent"
                              type="number"
                              placeholder="e.g. 250"
                              value={roomRentLimit}
                              onChange={(e) => setRoomRentLimit(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="policyFamilyLimit">Family Size Limit (Optional)</Label>
                          <Input
                            id="policyFamilyLimit"
                            type="number"
                            placeholder="e.g. 4 (Leave empty if individual)"
                            value={familySizeLimit}
                            onChange={(e) => setFamilySizeLimit(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {type === 'life' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="policyPremiumFrequency">Premium Frequency</Label>
                        <select
                          id="policyPremiumFrequency"
                          value={premiumFrequency}
                          onChange={(e) => setPremiumFrequency(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="Monthly" className="bg-card text-foreground">Monthly</option>
                          <option value="Yearly" className="bg-card text-foreground">Yearly</option>
                        </select>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={policyLoading}
                      className="w-full font-bold py-5 text-xs shadow-sm"
                    >
                      {policyLoading ? 'Creating...' : 'Register New Policy'}
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: Analytics & Reports */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Analytics Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border border-border shadow-xs bg-card relative overflow-hidden flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Gross Premiums collected</span>
                    <h3 className="text-2xl font-black text-foreground">${totalPremiumRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] font-semibold text-green-600 flex items-center">
                      <TrendingUp size={12} className="mr-1" />
                      <span>{totalPoliciesCount} policies active</span>
                    </p>
                  </div>
                  <span className="bg-green-500/10 text-green-500 p-3 rounded-2xl"><DollarSign size={24} /></span>
                </Card>

                <Card className="p-6 border border-border shadow-xs bg-card relative overflow-hidden flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Claims Payout settled</span>
                    <h3 className="text-2xl font-black text-foreground">${totalApprovedPayout.toLocaleString()}</h3>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Across {approvedClaimsCount} approved claims
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary p-3 rounded-2xl"><Activity size={24} /></span>
                </Card>

                <Card className="p-6 border border-border shadow-xs bg-card relative overflow-hidden flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Loss Ratio</span>
                    <h3 className="text-2xl font-black text-foreground">{lossRatio.toFixed(1)}%</h3>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      Target threshold: &lt; 60%
                    </p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl"><BarChart3 size={24} /></span>
                </Card>

                <Card className="p-6 border border-border shadow-xs bg-card relative overflow-hidden flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Claims Resolution Rate</span>
                    <h3 className="text-2xl font-black text-foreground">{resolutionRate.toFixed(1)}%</h3>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {resolvedClaims} of {totalClaimsCount} claims resolved
                    </p>
                  </div>
                  <span className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl"><CheckCircle2 size={24} /></span>
                </Card>
              </div>

              {/* Graphical breakdowns using simple CSS flex progress charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 border border-border shadow-sm bg-card space-y-6">
                  <div className="flex items-center space-x-2 border-b border-border pb-3">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><PieChart size={16} /></span>
                    <h3 className="font-bold text-foreground text-sm">Policy Sales Distribution</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>Health Policies ({healthPoliciesCount})</span>
                      <span>{totalPoliciesCount > 0 ? ((healthPoliciesCount / totalPoliciesCount) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>Life Policies ({lifePoliciesCount})</span>
                      <span>{totalPoliciesCount > 0 ? ((lifePoliciesCount / totalPoliciesCount) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden flex">
                      <div className="bg-green-500 h-full" style={{ width: `${totalPoliciesCount > 0 ? (healthPoliciesCount / totalPoliciesCount) * 100 : 0}%` }}></div>
                      <div className="bg-blue-500 h-full" style={{ width: `${totalPoliciesCount > 0 ? (lifePoliciesCount / totalPoliciesCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-border shadow-sm bg-card space-y-6">
                  <div className="flex items-center space-x-2 border-b border-border pb-3">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><Activity size={16} /></span>
                    <h3 className="font-bold text-foreground text-sm">Claims Processing Breakdown</h3>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Approved ({approvedClaimsCount})</span>
                        <span>{totalClaimsCount > 0 ? ((approvedClaimsCount / totalClaimsCount) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${totalClaimsCount > 0 ? (approvedClaimsCount / totalClaimsCount) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Pending Review ({pendingClaimsCount})</span>
                        <span>{totalClaimsCount > 0 ? ((pendingClaimsCount / totalClaimsCount) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${totalClaimsCount > 0 ? (pendingClaimsCount / totalClaimsCount) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Under Review ({reviewClaimsCount})</span>
                        <span>{totalClaimsCount > 0 ? ((reviewClaimsCount / totalClaimsCount) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${totalClaimsCount > 0 ? (reviewClaimsCount / totalClaimsCount) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>Rejected ({rejectedClaimsCount})</span>
                        <span>{totalClaimsCount > 0 ? ((rejectedClaimsCount / totalClaimsCount) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${totalClaimsCount > 0 ? (rejectedClaimsCount / totalClaimsCount) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Monthly Report Selector Section */}
              <Card className="p-6 border border-border shadow-sm bg-card space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-base">Monthly Performance & Settled Claims Report</h3>
                    <p className="text-muted-foreground text-xs">Generate and print reports filterable by specific months.</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="flex h-9 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold focus-visible:outline-hidden"
                    >
                      {monthsList.map((m, idx) => (
                        <option key={idx} value={idx.toString()}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="flex h-9 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold focus-visible:outline-hidden"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>

                    <Button onClick={handlePrint} size="sm" className="text-xs font-semibold flex items-center space-x-1.5">
                      <Printer size={13} />
                      <span>Print Report</span>
                    </Button>
                  </div>
                </div>

                {/* Printable Report Wrapper block */}
                <div id="printable-report" className="p-6 border border-border/80 rounded-2xl bg-muted/20 space-y-8 font-sans">
                  {/* Print Header (Only visible on print layout) */}
                  <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black tracking-tight text-slate-900">CURA INSURANCE</span>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p className="font-bold text-slate-800">Monthly Performance Report</p>
                      <p>Generated on: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <h4 className="text-lg font-extrabold text-foreground capitalize">
                      Monthly Report: {monthsList[selectedMonth]} {selectedYear}
                    </h4>
                    <p className="text-xs text-muted-foreground">Monthly revenue collection, policy activation rates, and claim disbursements log.</p>
                  </div>

                  {/* Monthly Metrics Summary Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Monthly Premium Collections</span>
                      <span className="text-lg font-black text-foreground">${monthlyPremiumCollected.toLocaleString()}</span>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Disbursed Claim Payouts</span>
                      <span className="text-lg font-black text-foreground">${monthlyClaimPayout.toLocaleString()}</span>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Policies Activated</span>
                      <span className="text-lg font-black text-foreground">{monthlyPolicies.length}</span>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Claims Submitted</span>
                      <span className="text-lg font-black text-foreground">{monthlyClaims.length}</span>
                    </div>
                  </div>

                  {/* Monthly Claims Details Table */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">Settled & Pending Claims Log</h5>
                    {monthlyClaims.length === 0 ? (
                      <p className="text-muted-foreground text-xs py-4 text-center border border-dashed border-border rounded-xl">
                        No claims filed or settled during this month.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold text-slate-800 dark:text-foreground">Claimant</TableHead>
                            <TableHead className="font-semibold text-slate-800 dark:text-foreground">Policy</TableHead>
                            <TableHead className="font-semibold text-slate-800 dark:text-foreground">Incident Date</TableHead>
                            <TableHead className="font-semibold text-slate-800 dark:text-foreground">Requested</TableHead>
                            <TableHead className="font-semibold text-slate-800 dark:text-foreground">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthlyClaims.map((c) => (
                            <TableRow key={c._id} className="hover:bg-muted/30">
                              <TableCell>
                                <span className="font-bold text-slate-900 dark:text-foreground block">{c.userRef?.name}</span>
                                <span className="text-[10px] text-slate-500 block">{c.userRef?.email}</span>
                              </TableCell>
                              <TableCell className="text-slate-700 dark:text-foreground">{c.userPolicyRef?.policyRef?.title || 'Policy'}</TableCell>
                              <TableCell className="text-slate-700 dark:text-foreground">{new Date(c.incidentDate).toLocaleDateString()}</TableCell>
                              <TableCell className="font-bold text-slate-900 dark:text-foreground">${c.claimAmount?.toLocaleString()}</TableCell>
                              <TableCell>
                                <span className="font-semibold text-[10px] capitalize text-slate-750 dark:text-foreground">{c.status}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      )}

      {/* Expandable Review Side Drawer (Slides in from Right) */}
      <div className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 flex flex-col no-print ${
        drawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedClaim && (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Claim Review Panel</span>
                <h3 className="font-bold text-foreground text-base">Claim #{selectedClaim._id.slice(-6).toUpperCase()}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={closeReviewDrawer}
                className="p-1 rounded-lg hover:text-red-500 hover:border-red-200"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Claimant Card */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Claimant Information</span>
                <div className="bg-muted/30 rounded-xl p-4 border border-border text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-bold text-foreground">{selectedClaim.userRef?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-bold text-foreground select-all">{selectedClaim.userRef?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claimant Phone</span>
                    <span className="font-semibold text-foreground">{selectedClaim.userRef?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-semibold text-foreground max-w-xs text-right truncate">{selectedClaim.userRef?.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Policy Specifications */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Linked Policy Specifications</span>
                <div className="bg-muted/30 rounded-xl p-4 border border-border text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy Title</span>
                    <span className="font-bold text-foreground">{selectedClaim.userPolicyRef?.policyRef?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Amount</span>
                    <span className="font-bold text-foreground">${selectedClaim.userPolicyRef?.policyRef?.coverageAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Policy Status</span>
                    <span className="font-bold capitalize text-primary">{selectedClaim.userPolicyRef?.status}</span>
                  </div>
                </div>
              </div>

              {/* Claim Request Specifications */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Requested Compensation details</span>
                <div className="bg-muted/30 rounded-xl p-4 border border-border text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Requested Amount</span>
                    <span className="font-extrabold text-primary text-sm">${selectedClaim.claimAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Incident Date</span>
                    <span className="font-bold text-foreground">{new Date(selectedClaim.incidentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-semibold">Incident Explanation:</span>
                    <p className="text-foreground leading-relaxed bg-card border border-border rounded-lg p-2.5 text-[11px] max-h-36 overflow-y-auto">
                      {selectedClaim.reason}
                    </p>
                  </div>

                  {/* Attached Documents */}
                  {selectedClaim.proofDocuments && selectedClaim.proofDocuments.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Evidence Documents</span>
                      <div className="space-y-1.5">
                        {selectedClaim.proofDocuments.map((doc, idx) => (
                          <a
                            key={idx}
                            href={`http://localhost:5000${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-between p-2 border border-border hover:border-primary/55 rounded-lg text-[11px] font-bold text-primary hover:bg-muted/40 transition-all cursor-pointer bg-card"
                          >
                            <span className="inline-flex items-center space-x-1.5">
                              <FolderOpen size={12} className="text-primary" />
                              <span>Receipt_Evidence_{idx + 1}.pdf</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">View</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviewer remarks from previous reviews */}
              {selectedClaim.adminRemarks && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Previous Assessor Remarks</span>
                  <div className="bg-muted/30 border border-border rounded-xl p-4 text-xs">
                    <p className="text-foreground leading-relaxed">{selectedClaim.adminRemarks}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Decision Form */}
            {selectedClaim.status === 'pending' || selectedClaim.status === 'under_review' ? (
              <form onSubmit={handleUpdateClaimStatus} className="p-5 border-t border-border bg-muted/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="decisionSelect" className="text-[10px] uppercase block tracking-wider">Decision</Label>
                    <select
                      id="decisionSelect"
                      value={decisionStatus}
                      onChange={(e) => setDecisionStatus(e.target.value)}
                      className="w-full h-8 px-2 border border-input rounded-lg text-slate-750 text-xs font-semibold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring bg-card"
                    >
                      <option value="approved" className="bg-card text-foreground">Approve Claim</option>
                      <option value="rejected" className="bg-card text-foreground">Reject Claim</option>
                      <option value="under_review" className="bg-card text-foreground">Mark Under Review</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="remarksTextarea" className="text-[10px] uppercase block tracking-wider">Assessor Notes / Remarks</Label>
                  <Textarea
                    id="remarksTextarea"
                    rows="3"
                    placeholder="Provide details for approval, partial coverage details, or rejection reasons..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    required={decisionStatus === 'rejected'}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-5 text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50 ${
                    decisionStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    decisionStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {actionLoading ? 'Saving Decision...' : 'Save Decision'}
                </Button>
              </form>
            ) : (
              <div className="p-5 border-t border-border bg-muted/20 text-center text-xs font-semibold text-muted-foreground">
                Decision finalized as <span className="uppercase text-foreground font-bold">{selectedClaim.status}</span>.
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer Overlay backdrop */}
      {drawerOpen && (
        <div 
          onClick={closeReviewDrawer}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity no-print"
        />
      )}
    </div>
  );
};

export default AdminDashboard;
