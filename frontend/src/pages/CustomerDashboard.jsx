import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ClipboardList, PlusCircle, ShieldAlert, LogOut, FileText, Shield, CreditCard, Store, UserCircle, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '../components/ThemeToggle';

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');

  // Payment form state
  const [paymentPolicyId, setPaymentPolicyId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('monthly');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMsg, setPaymentMsg] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Purchase state
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseMsg, setPurchaseMsg] = useState(null);

  const defaultAvatar = `https://ui-avatars.com/api/?background=6366f1&color=fff&size=64&name=${encodeURIComponent(user?.name || 'User')}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, claimsRes, plansRes, paymentsRes] = await Promise.all([
          api.get('/user-policies/my'),
          api.get('/claims/my-claims'),
          api.get('/policies'),
          api.get('/payments/my')
        ]);
        setPolicies(policiesRes.data);
        setClaims(claimsRes.data);
        setAllPlans(plansRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchase = async (plan) => {
    setPurchasingId(plan._id);
    setPurchaseMsg(null);
    try {
      await api.post('/user-policies/buy', { policyId: plan._id });
      setPurchaseMsg({ type: 'success', text: `Successfully purchased "${plan.title}"!` });
      // Refresh policies
      const [policiesRes, paymentsRes] = await Promise.all([
        api.get('/user-policies/my'),
        api.get('/payments/my'),
      ]);
      setPolicies(policiesRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      setPurchaseMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed.' });
    } finally {
      setPurchasingId(null);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentMsg(null);
    try {
      await api.post('/payments', {
        userPolicyId: paymentPolicyId,
        amount: Number(paymentAmount),
        paymentType,
        note: paymentNote || undefined,
      });
      setPaymentMsg({ type: 'success', text: 'Payment recorded successfully!' });
      setPaymentAmount('');
      setPaymentNote('');
      // Refresh payments
      const res = await api.get('/payments/my');
      setPayments(res.data);
    } catch (err) {
      setPaymentMsg({ type: 'error', text: err.response?.data?.message || 'Payment failed.' });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const tabs = [
    { id: 'policies', label: 'My Policies', icon: FileText },
    { id: 'plans', label: 'Browse Plans', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'claims', label: 'Claims', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
              <Shield size={18} />
            </span>
            <span className="text-xl font-black text-foreground tracking-tight">Cura</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Customer
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img
                src={user?.image || defaultAvatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-border shadow-sm"
              />
              <span className="text-muted-foreground text-sm font-semibold hidden sm:inline">{user?.name}</span>
            </Link>
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manage Your Insurance</h1>
              <p className="mt-1 text-primary-foreground/80 text-xs max-w-xl">
                View your active health and life policies, check status, make payments, and submit claims online for quick reviews.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/profile">
                <Button variant="secondary" size="sm" className="text-xs font-bold bg-white/20 border border-white/30 text-white hover:bg-white/30">
                  <UserCircle size={14} className="mr-1.5" />
                  My Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted/50 p-1 rounded-2xl border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ======= TAB: My Policies ======= */}
          {activeTab === 'policies' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Policies */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border border-border shadow-sm bg-card p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-border pb-4">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><FileText size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">My Active Policies</h2>
                  </div>

                  {policies.length === 0 ? (
                    <p className="text-muted-foreground text-xs py-4">You have not purchased any policies yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {policies.map((p) => (
                        <Card key={p._id} className="border border-border/80 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden bg-card flex flex-col justify-between">
                          <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full ${p.policyRef?.type === 'health' ? 'bg-green-50' : 'bg-blue-50'} opacity-30`}></div>
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${p.policyRef?.type === 'health' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                {p.policyRef?.type}
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                p.status === 'active' ? 'bg-green-50 text-green-800' : p.status === 'claimed' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-foreground text-sm mb-1">{p.policyRef?.title}</h3>
                            <p className="text-muted-foreground text-[10px] mb-3">Expires: {new Date(p.endDate).toLocaleDateString()}</p>
                            
                            {/* Policy details */}
                            <div className="space-y-1.5 mb-4 border-t border-border/40 pt-3 text-[11px]">
                              {p.policyRef?.waitingPeriodDays && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Waiting Period:</span>
                                  <span className="font-semibold text-foreground">{p.policyRef.waitingPeriodDays} Days</span>
                                </div>
                              )}
                              {p.policyRef?.roomRentLimit && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Room Rent Limit:</span>
                                  <span className="font-semibold text-foreground">${p.policyRef.roomRentLimit}/day</span>
                                </div>
                              )}
                              {p.policyRef?.familySizeLimit && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Family Size Limit:</span>
                                  <span className="font-semibold text-foreground">{p.policyRef.familySizeLimit} members</span>
                                </div>
                              )}
                              {p.beneficiary && (
                                <div className="flex justify-between bg-blue-500/5 px-2 py-1 rounded-md mt-1">
                                  <span className="text-muted-foreground font-semibold">Beneficiary:</span>
                                  <span className="font-bold text-foreground">{p.beneficiary}</span>
                                </div>
                              )}
                              {p.coveredMembers && p.coveredMembers.length > 0 && (
                                <div className="bg-green-500/5 px-2 py-1 rounded-md mt-1 space-y-1">
                                  <span className="text-muted-foreground font-semibold block">Covered Members:</span>
                                  <div className="pl-1.5 space-y-0.5 max-h-[60px] overflow-y-auto">
                                    {p.coveredMembers.map((member, idx) => (
                                      <div key={idx} className="font-bold text-foreground text-[10px]">• {member.name}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-border/60 text-xs">
                            <div>
                              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                                {p.policyRef?.type === 'life' 
                                  ? 'Death Benefit' 
                                  : p.policyRef?.familySizeLimit 
                                    ? 'Total Sum Insured' 
                                    : 'Sum Insured'}
                              </p>
                              <p className="font-bold text-foreground text-sm">${p.policyRef?.coverageAmount?.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Premium</p>
                              <p className="font-bold text-foreground text-sm">
                                ${p.policyRef?.premium} <span className="text-[10px] font-normal text-muted-foreground">/{p.policyRef?.premiumFrequency?.toLowerCase() || 'month'}</span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right: Submit Claim Shortcut Card */}
              <div>
                <Card className="border border-border p-6 shadow-sm bg-card rounded-3xl space-y-6 sticky top-24">
                  <div className="flex items-center space-x-2.5">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><PlusCircle size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Need to file a claim?</h2>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Have you experienced a medical incident or policy event? File a claim request online. Our secure multi-step wizard will guide you through entering your incident details, checking coverage limits, and uploading proof documents.
                  </p>

                  {policies.length === 0 ? (
                    <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-semibold">
                      <ShieldAlert size={16} />
                      <span>No active policies available.</span>
                    </div>
                  ) : (
                    <Link to="/customer/claims/new" className="block w-full">
                      <Button className="w-full font-bold py-5 text-xs transition-colors shadow-sm">
                        Start Claim Submission
                      </Button>
                    </Link>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ======= TAB: Browse Plans ======= */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {purchaseMsg && (
                <div className={`max-w-md mx-auto p-4 rounded-xl text-center text-xs font-semibold border ${
                  purchaseMsg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {purchaseMsg.text}
                </div>
              )}

              <div className="flex flex-wrap items-stretch justify-center gap-6">
                {allPlans.map((p, index) => {
                  const isFeatured = index === 1;
                  const alreadyOwned = policies.some(up => up.policyRef?._id === p._id);
                  return (
                    <div
                      key={p._id}
                      className={`w-80 relative text-center p-6 pb-14 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
                        isFeatured
                          ? 'bg-primary text-primary-foreground border border-primary/30 shadow-xl shadow-primary/20'
                          : 'bg-card text-foreground border border-border shadow-md'
                      }`}
                    >
                      {isFeatured && (
                        <span className="absolute px-3 text-[10px] font-bold -top-3 left-4 py-1 bg-primary-foreground text-primary rounded-full uppercase tracking-wider shadow-sm">
                          Most Popular
                        </span>
                      )}

                      <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full mb-3 ${
                        isFeatured
                          ? 'bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30'
                          : p.type === 'health'
                            ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50'
                            : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50'
                      }`}>
                        {p.type}
                      </span>

                      <p className="font-semibold text-sm">{p.title}</p>

                      <h3 className="text-3xl font-bold mt-1">
                        ${p.premium}
                        <span className={`text-sm font-normal ${isFeatured ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          /{p.premiumFrequency ? p.premiumFrequency.toLowerCase() : 'month'}
                        </span>
                      </h3>

                      <p className={`text-xs mt-1 font-medium ${isFeatured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        Coverage: <strong className={isFeatured ? 'text-primary-foreground' : 'text-foreground'}>${p.coverageAmount?.toLocaleString()}</strong>
                      </p>

                      <ul className={`list-none text-sm mt-6 space-y-2 text-left ${isFeatured ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                        {p.benefits && p.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                              <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                            </svg>
                            <p className="text-xs">{benefit}</p>
                          </li>
                        ))}
                      </ul>

                      <p className={`text-[10px] mt-4 font-semibold uppercase tracking-wider ${isFeatured ? 'text-primary-foreground/60' : 'text-muted-foreground/70'}`}>
                        {p.termYears} Year Term
                      </p>

                      <button
                        type="button"
                        onClick={() => handlePurchase(p)}
                        disabled={purchasingId === p._id || alreadyOwned}
                        className={`text-sm w-full py-2.5 rounded-lg font-semibold mt-5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          alreadyOwned
                            ? 'bg-green-100 text-green-700 cursor-not-allowed dark:bg-green-950/30 dark:text-green-400'
                            : isFeatured
                              ? 'bg-primary-foreground text-primary hover:opacity-90 shadow-sm'
                              : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                        }`}
                      >
                        {alreadyOwned ? '✓ Already Purchased' : purchasingId === p._id ? 'Processing...' : 'Purchase Coverage'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======= TAB: Payments ======= */}
          {activeTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Payment History */}
              <div className="lg:col-span-2">
                <Card className="border border-border shadow-sm bg-card p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-border pb-4">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><CreditCard size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Payment History</h2>
                  </div>

                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-xs py-4">No payments recorded yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Policy</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((pay) => (
                          <TableRow key={pay._id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold text-foreground text-xs">{pay.userPolicyRef?.policyRef?.title || 'Policy'}</TableCell>
                            <TableCell className="text-xs">${pay.amount?.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                pay.paymentType === 'monthly' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                              }`}>
                                {pay.paymentType}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">{new Date(pay.paymentDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                pay.status === 'completed' ? 'bg-green-50 text-green-700' :
                                pay.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {pay.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>

              {/* Right: Make Payment Form */}
              <div>
                <Card className="border border-border p-6 shadow-sm bg-card rounded-3xl space-y-6 sticky top-24">
                  <div className="flex items-center space-x-2.5">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><CreditCard size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Make a Payment</h2>
                  </div>

                  {paymentMsg && (
                    <div className={`p-3 rounded-xl text-center text-xs font-semibold border ${
                      paymentMsg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {paymentMsg.text}
                    </div>
                  )}

                  {policies.length === 0 ? (
                    <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-semibold">
                      <ShieldAlert size={16} />
                      <span>Purchase a policy first to make payments.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleMakePayment} className="space-y-4">
                      {/* Select Policy */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Policy</label>
                        <select
                          value={paymentPolicyId}
                          onChange={(e) => setPaymentPolicyId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        >
                          <option value="">Select a policy...</option>
                          {policies.map((p) => (
                            <option key={p._id} value={p._id}>{p.policyRef?.title} — ${p.policyRef?.premium}/{p.policyRef?.premiumFrequency?.toLowerCase() || 'month'}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Payment Type</label>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setPaymentType('monthly')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              paymentType === 'monthly'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType('custom')}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              paymentType === 'custom'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Amount ($)</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          required
                          min="1"
                          placeholder="Enter amount"
                          className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>

                      {/* Note (for custom) */}
                      {paymentType === 'custom' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Note (optional)</label>
                          <input
                            type="text"
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            placeholder="Payment description"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submittingPayment || !paymentPolicyId || !paymentAmount}
                        className="w-full font-bold py-5 text-xs transition-colors shadow-sm"
                      >
                        {submittingPayment ? 'Processing...' : 'Submit Payment'}
                      </Button>
                    </form>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ======= TAB: Claims ======= */}
          {activeTab === 'claims' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border border-border shadow-sm bg-card p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-border pb-4">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><ClipboardList size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">My Claim History</h2>
                  </div>

                  {claims.length === 0 ? (
                    <p className="text-muted-foreground text-xs py-4">No claims filed yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Policy</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Incident Date</TableHead>
                          <TableHead className="font-semibold">Reason</TableHead>
                          <TableHead className="font-semibold text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims.map((c) => (
                          <TableRow key={c._id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold text-foreground">{c.userPolicyRef?.policyRef?.title || 'Policy'}</TableCell>
                            <TableCell>${c.claimAmount?.toLocaleString()}</TableCell>
                            <TableCell>{new Date(c.incidentDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs max-w-xs truncate">{c.reason}</TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                c.status === 'approved' ? 'bg-green-50 text-green-700' :
                                c.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                c.status === 'under_review' ? 'bg-amber-50 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {c.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>

              {/* Right: File Claim Shortcut */}
              <div>
                <Card className="border border-border p-6 shadow-sm bg-card rounded-3xl space-y-6 sticky top-24">
                  <div className="flex items-center space-x-2.5">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl"><PlusCircle size={18} /></span>
                    <h2 className="text-lg font-bold text-foreground">Need to file a claim?</h2>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Upload receipts and clinical reports directly. Payouts are resolved fast through our streamlined review process.
                  </p>

                  {policies.length === 0 ? (
                    <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-semibold">
                      <ShieldAlert size={16} />
                      <span>No active policies available.</span>
                    </div>
                  ) : (
                    <Link to="/customer/claims/new" className="block w-full">
                      <Button className="w-full font-bold py-5 text-xs transition-colors shadow-sm">
                        Start Claim Submission
                      </Button>
                    </Link>
                  )}
                </Card>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default CustomerDashboard;
