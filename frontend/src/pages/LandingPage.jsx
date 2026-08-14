import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    Shield,
    Heart,
    Activity,
    Check,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    LogIn,
    Menu,
    X,
    DollarSign,
    Users,
    Award,
    Percent,
    Star,
    MessageSquare,
    ArrowRight,
    Zap,
    ShieldCheck,
    HelpCircle,
    FileText,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const LandingPage = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    // Dynamic backend data
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchaseMessage, setPurchaseMessage] = useState(null);
    const [purchasingId, setPurchasingId] = useState(null);

    // UI state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Premium Calculator Widget State
    const [calcType, setCalcType] = useState("health"); // 'health' | 'life'
    const [calcAge, setCalcAge] = useState(30);
    const [calcCoverage, setCalcCoverage] = useState(250000); // coverage amount
    const [calculatedPremium, setCalculatedPremium] = useState(45);

    // Purchase Modal State
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [coveredMembers, setCoveredMembers] = useState([]);
    const [beneficiary, setBeneficiary] = useState("");
    const [customersList, setCustomersList] = useState([]);

    // Fetch real catalog policies
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const res = await api.get("/policies");
                setPolicies(res.data);
            } catch (err) {
                console.error("Error fetching policies:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    // Fetch customers list for Family Floater policy
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get("/auth/customers");
                setCustomersList(res.data);
            } catch (err) {
                console.error("Error fetching customers:", err);
            }
        };
        if (user && user.role === "customer") {
            fetchCustomers();
        }
    }, [user]);

    // Live premium calculations
    useEffect(() => {
        let base = calcType === "health" ? 25 : 15;
        let ageFactor =
            Math.max(0, calcAge - 18) * (calcType === "health" ? 1.25 : 1.85);
        let coverageFactor =
            (calcCoverage / 100000) * (calcType === "health" ? 8 : 12);
        setCalculatedPremium(Math.round(base + ageFactor + coverageFactor));
    }, [calcType, calcAge, calcCoverage]);

    const handlePurchase = async (policyId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "customer") {
            alert("Only customers are allowed to purchase policies.");
            return;
        }

        setPurchasingId(policyId);
        setPurchaseMessage(null);

        try {
            await api.post("/user-policies/buy", {
                policyId,
                coveredMembers,
                beneficiary,
            });
            setPurchaseMessage({
                type: "success",
                text: "Policy purchased successfully! Redirecting to your dashboard...",
            });
            setTimeout(() => {
                setShowPurchaseDialog(false);
                navigate("/customer/dashboard");
            }, 1500);
        } catch (err) {
            setPurchaseMessage({
                type: "error",
                text:
                    err.response?.data?.message || "Failed to purchase policy.",
            });
        } finally {
            setPurchasingId(null);
        }
    };

    const handlePurchaseClick = (policy) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "customer") {
            alert("Only customers are allowed to purchase policies.");
            return;
        }

        setSelectedPolicy(policy);
        setCoveredMembers([]);
        setBeneficiary("");
        setPurchaseMessage(null);
        setShowPurchaseDialog(true);
    };

    const scrollToPlans = () => {
        document
            .getElementById("plans")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToCalculator = () => {
        document
            .getElementById("calculator")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 transition-colors duration-200">
            {/* 1. Header / Navbar */}
            <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    {/* Logo with Shield/Pulse */}
                    <div
                        className="flex items-center space-x-2.5 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <span className="bg-gradient-to-tr from-primary to-blue-600 text-white p-2 rounded-xl shadow-lg shadow-primary/25">
                            <Shield size={20} className="animate-pulse" />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight bg-clip-text text-foreground">
                                AegisCare
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                InsurTech
                            </span>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                        <a
                            href="#plans"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Health Plans
                        </a>
                        <a
                            href="#calculator"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Premium Calculator
                        </a>
                        <a
                            href="#features"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            How It Works
                        </a>
                        <a
                            href="#testimonials"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reviews
                        </a>
                    </nav>

                    {/* CTAs */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to={
                                        user.role === "customer"
                                            ? "/customer/dashboard"
                                            : "/admin/dashboard"
                                    }
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs font-bold rounded-xl px-4 py-4"
                                    >
                                        Go to Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-xs font-bold text-muted-foreground hover:text-red-500"
                                >
                                    Log out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs font-bold flex items-center space-x-1.5 py-4"
                                    >
                                        <LogIn size={14} />
                                        <span>Sign In</span>
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button
                                        size="sm"
                                        className="text-xs font-bold rounded-xl shadow-md px-5 py-4 bg-primary hover:bg-primary/95 text-white"
                                    >
                                        Get Covered
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-3 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg border border-border"
                        >
                            {mobileMenuOpen ? (
                                <X size={20} />
                            ) : (
                                <Menu size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Links drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-card px-4 py-6 space-y-4">
                        <nav className="flex flex-col space-y-3.5 text-sm font-semibold">
                            <a
                                href="#plans"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Health Plans
                            </a>
                            <a
                                href="#calculator"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Premium Calculator
                            </a>
                            <a
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                How It Works
                            </a>
                            <a
                                href="#testimonials"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Reviews
                            </a>
                        </nav>
                        <div className="border-t border-border pt-4 flex flex-col space-y-2">
                            {user ? (
                                <>
                                    <Link
                                        to={
                                            user.role === "customer"
                                                ? "/customer/dashboard"
                                                : "/admin/dashboard"
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full text-xs font-bold"
                                        >
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-xs font-bold text-red-500"
                                    >
                                        Log out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="w-full text-xs font-bold"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button className="w-full text-xs font-bold bg-primary hover:bg-primary/95 text-white">
                                            Get Covered
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 2. Hero Section */}
            <section className="bg-gradient-to-b from-card via-background to-background border-b border-border py-16 sm:py-24 px-4 relative overflow-hidden">
                {/* Decorative dynamic shapes */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute -top-10 -right-20 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Text Column */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center space-x-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={13} className="animate-pulse" />
                            <span>Zero Deductible Health Policies</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-foreground">
                            Smart, Transparent <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-emerald-500">
                                Health & Life Insurance
                            </span>{" "}
                            <br />
                            for What Matters Most.
                        </h1>

                        <p className="max-w-xl mx-auto lg:mx-0 text-muted-foreground text-sm sm:text-base leading-relaxed">
                            Experience the AegisCare difference. Paperless
                            digital enrollment, instant policy generation,
                            out-of-pocket calculators, and secure payouts
                            settled directly in under 48 hours.
                        </p>

                        {/* Hero CTAs */}
                        <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <Button
                                size="lg"
                                onClick={scrollToCalculator}
                                className="rounded-xl shadow-lg shadow-primary/20 font-extrabold text-sm py-6 bg-primary hover:bg-primary/95 text-white"
                            >
                                Calculate Your Premium
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={scrollToPlans}
                                className="rounded-xl font-extrabold text-sm py-6 bg-card border-border hover:bg-muted"
                            >
                                Explore Core Plans
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-8 border-t border-border/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                            <div>
                                <p className="text-xl sm:text-2xl font-black text-foreground">
                                    $500M+
                                </p>
                                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Claims Settled
                                </p>
                            </div>
                            <div className="border-x border-border/80 px-2 sm:px-4">
                                <p className="text-xl sm:text-2xl font-black text-foreground">
                                    99.2%
                                </p>
                                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Settlement Ratio
                                </p>
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-black text-foreground">
                                    2M+
                                </p>
                                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Active Policyholders
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Visual Column (Interactive Preview Card) */}
                    <div className="lg:col-span-5 flex justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-emerald-500/10 rounded-3xl blur-2xl -z-10"></div>

                        {/* Interactive Preview Card Container */}
                        <Card className="w-full max-w-sm border border-border/80 shadow-2xl p-6 rounded-3xl bg-card/90 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -z-10"></div>

                            {/* Header */}
                            <div className="flex justify-between items-center pb-4 border-b border-border/60">
                                <div className="flex items-center space-x-2">
                                    <span className="bg-emerald-500 text-white p-1 rounded-lg">
                                        <ShieldCheck size={16} />
                                    </span>
                                    <div>
                                        <h4 className="font-extrabold text-xs text-foreground leading-tight">
                                            Aegis Shield Plus
                                        </h4>
                                        <span className="text-[9px] text-muted-foreground">
                                            Active Health Coverage
                                        </span>
                                    </div>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                                    Active
                                </span>
                            </div>

                            {/* Coverage Details */}
                            <div className="py-4 space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Max Coverage Limit
                                    </span>
                                    <span className="text-lg font-black text-foreground">
                                        $1,000,000
                                    </span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[85%]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                    <span>Available: $850,000</span>
                                    <span>Premium: $58/mo</span>
                                </div>
                            </div>

                            {/* Claims History Box */}
                            <div className="pt-4 border-t border-border/60 space-y-3">
                                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Real-time Outpatient Claims
                                </h5>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2.5 bg-muted/40 border border-border/60 rounded-xl text-[11px] font-medium">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    Dental Extraction
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">
                                                    Claim ID: #2950A
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">
                                                $450.00
                                            </p>
                                            <span className="text-[9px] text-emerald-600 font-bold">
                                                Approved
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 bg-muted/40 border border-border/60 rounded-xl text-[11px] font-medium">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    Prescription Copay
                                                </p>
                                                <p className="text-[9px] text-muted-foreground">
                                                    Claim ID: #3041B
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">
                                                $85.00
                                            </p>
                                            <span className="text-[9px] text-blue-600 font-bold">
                                                In Review
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 3. Interactive Quick Premium Estimator Widget */}
            <section
                id="calculator"
                className="py-20 px-4 bg-muted/30 border-b border-border"
            >
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Zap size={12} />
                            <span>Premium Estimator</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Estimate Your Plan Premium Instantly
                        </h2>
                        <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                            Get an immediate projection. Real plans may differ
                            slightly depending on health history.
                        </p>
                    </div>

                    <Card className="border border-border/80 p-6 sm:p-8 shadow-xl bg-card rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Controls Column */}
                            <div className="space-y-6">
                                {/* 1. Toggle Product Type */}
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        1. Select Policy Coverage
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-xl border border-border/80">
                                        <Button
                                            type="button"
                                            variant={
                                                calcType === "health"
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            onClick={() =>
                                                setCalcType("health")
                                            }
                                            className={`text-xs font-bold py-3.5 rounded-lg transition-all ${
                                                calcType === "health"
                                                    ? "bg-primary text-white"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Activity
                                                size={14}
                                                className="mr-1.5"
                                            />
                                            <span>Health Care</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={
                                                calcType === "life"
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            onClick={() => setCalcType("life")}
                                            className={`text-xs font-bold py-3.5 rounded-lg transition-all ${
                                                calcType === "life"
                                                    ? "bg-primary text-white"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Users
                                                size={14}
                                                className="mr-1.5"
                                            />
                                            <span>Term Life</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* 2. Age Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <span>2. Age Bracket</span>
                                        <span className="text-foreground text-sm font-black">
                                            {calcAge} Years Old
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="18"
                                        max="75"
                                        value={calcAge}
                                        onChange={(e) =>
                                            setCalcAge(Number(e.target.value))
                                        }
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                        <span>18 yrs</span>
                                        <span>75 yrs</span>
                                    </div>
                                </div>

                                {/* 3. Coverage Selector */}
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        3. Targeted Coverage Limit
                                    </span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[100000, 250000, 500000].map((amt) => (
                                            <Button
                                                key={amt}
                                                type="button"
                                                variant={
                                                    calcCoverage === amt
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() =>
                                                    setCalcCoverage(amt)
                                                }
                                                className={`text-xs font-bold py-3 ${
                                                    calcCoverage === amt
                                                        ? "bg-primary text-white"
                                                        : "border-border text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                ${(amt / 1000).toFixed(0)}k
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Output Display Column */}
                            <div className="bg-muted/40 border border-border/80 rounded-2xl p-6 text-center space-y-6">
                                <div>
                                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                                        Estimated Starting Premium
                                    </span>
                                    <div className="flex justify-center items-baseline space-x-1 mt-2">
                                        <span className="text-5xl font-black text-foreground tracking-tight">
                                            ${calculatedPremium}
                                        </span>
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            / month
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        Coverage up to{" "}
                                        <span className="font-bold text-foreground">
                                            ${calcCoverage.toLocaleString()}
                                        </span>
                                        . No broker commission included.
                                    </p>
                                </div>

                                <div className="h-px bg-border"></div>

                                <Button
                                    onClick={scrollToPlans}
                                    className="w-full font-bold py-5 rounded-xl text-xs flex items-center justify-center space-x-1"
                                >
                                    <span>Explore Plan Details</span>
                                    <ArrowRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* 4. Core Features & Benefits */}
            <section
                id="features"
                className="py-20 px-4 max-w-7xl mx-auto space-y-16 border-b border-border/60"
            >
                <div className="text-center space-y-3">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
                        Benefits
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Why AegisCare is Built Different
                    </h2>
                    <p className="text-muted-foreground text-xs max-w-md mx-auto">
                        Traditional health plans involve stacks of paper claims.
                        AegisCare processes everything digitally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow">
                        <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Zap size={20} />
                        </span>
                        <h3 className="font-bold text-foreground text-sm">
                            Instant Digital Claims
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Scan receipts directly on your phone, upload proof
                            documents, and receive updates on your dashboard in
                            minutes.
                        </p>
                    </div>

                    <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow">
                        <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </span>
                        <h3 className="font-bold text-foreground text-sm">
                            Tailored Coverage
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Configure coverages matching your requirements.
                            Upgrade term lengths or change limits dynamically on
                            renewal.
                        </p>
                    </div>

                    <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow">
                        <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <FileText size={20} />
                        </span>
                        <h3 className="font-bold text-foreground text-sm">
                            Zero Paperwork
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            No medical tests for health catalog plans up to
                            $500,000. Enrollment complete in under 5 minutes
                            online.
                        </p>
                    </div>

                    <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow">
                        <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Activity size={20} />
                        </span>
                        <h3 className="font-bold text-foreground text-sm">
                            48-Hour Payouts
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Approved claim payouts are dispatched directly to
                            your registered bank account via secure instant
                            transfer.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5. How It Works Section */}
            <section className="py-20 px-4 bg-muted/20 border-b border-border/60">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-3">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
                            Process
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Get Protected in Three Steps
                        </h2>
                        <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                            AegisCare eliminates brokers and processes
                            everything directly online.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Step 1 */}
                        <div className="text-center space-y-4 relative">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-base font-black shadow-lg">
                                1
                            </div>
                            <h3 className="font-bold text-foreground text-sm">
                                Select Your Plan
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                                Explore different modular health and term life
                                policies. Adjust terms and limits to fit your
                                requirements.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center space-y-4 relative">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-base font-black shadow-lg">
                                2
                            </div>
                            <h3 className="font-bold text-foreground text-sm">
                                Instant Digital Checkout
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                                Create an account, submit your eligibility
                                details, and execute instant secure digital
                                enrollment.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center space-y-4 relative">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-base font-black shadow-lg">
                                3
                            </div>
                            <h3 className="font-bold text-foreground text-sm">
                                File Claims in Minutes
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                                Upload receipts and clinical reports directly
                                inside your customer dashboard. Payouts are
                                resolved fast.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Policies List Section */}
            <section id="plans" className="py-20 px-4 bg-background">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
                            Catalog
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Explore Our Active Policy Plans
                        </h2>
                        <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                            Select the plan that fits your life requirements.
                            Click buy to instantly register and get covered.
                        </p>
                    </div>

                    {purchaseMessage && (
                        <div
                            className={`max-w-md mx-auto p-4 rounded-xl text-center text-xs font-semibold border ${
                                purchaseMessage.type === "success"
                                    ? "bg-green-50 border-green-100 text-green-700"
                                    : "bg-red-50 border-red-100 text-red-700"
                            }`}
                        >
                            {purchaseMessage.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : policies.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-12">
                            No policies are currently active. Please contact the
                            administrator.
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {policies.map((p, index) => {
                                const isFeatured = index === 1;
                                return (
                                    <div
                                        key={p._id}
                                        className={`w-80 relative text-center p-6 pb-14 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
                                            isFeatured
                                                ? "bg-primary text-primary-foreground border border-primary/30 shadow-xl shadow-primary/20"
                                                : "bg-card text-foreground border border-border shadow-md"
                                        }`}
                                    >
                                        {/* Featured badge */}
                                        {isFeatured && (
                                            <span className="absolute px-3 text-[10px] font-bold -top-3 left-4 py-1 bg-primary-foreground text-primary rounded-full uppercase tracking-wider shadow-sm">
                                                Most Popular
                                            </span>
                                        )}

                                        {/* Policy type badge */}
                                        <span
                                            className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full mb-3 ${
                                                isFeatured
                                                    ? "bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30"
                                                    : p.type === "health"
                                                      ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                                                      : "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
                                            }`}
                                        >
                                            {p.type}
                                        </span>

                                        {/* Policy name */}
                                        <p
                                            className={`font-semibold text-sm ${isFeatured ? "pt-1" : ""}`}
                                        >
                                            {p.title}
                                        </p>

                                        {/* Price */}
                                        <h3 className="text-3xl font-bold mt-1">
                                            ${p.premium}
                                            <span
                                                className={`text-sm font-normal ${isFeatured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                                            >
                                                /
                                                {p.premiumFrequency
                                                    ? p.premiumFrequency.toLowerCase()
                                                    : "month"}
                                            </span>
                                        </h3>

                                        {/* Coverage amount */}
                                        <p
                                            className={`text-xs mt-1 font-medium ${isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                                        >
                                            {p.type === "life"
                                                ? "Death Benefit"
                                                : p.familySizeLimit
                                                  ? "Total Sum Insured"
                                                  : "Sum Insured"}
                                            :{" "}
                                            <strong
                                                className={
                                                    isFeatured
                                                        ? "text-primary-foreground"
                                                        : "text-foreground"
                                                }
                                            >
                                                $
                                                {p.coverageAmount?.toLocaleString()}
                                            </strong>
                                        </p>

                                        {/* Benefits list */}
                                        <ul
                                            className={`list-none text-sm mt-6 space-y-2 text-left ${isFeatured ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                                        >
                                            {/* Custom attributes shown as special items */}
                                            {p.waitingPeriodDays && (
                                                <li className="flex items-center gap-2">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                    <p className="text-xs">
                                                        Waiting Period:{" "}
                                                        <strong>
                                                            {
                                                                p.waitingPeriodDays
                                                            }{" "}
                                                            Days
                                                        </strong>
                                                    </p>
                                                </li>
                                            )}
                                            {p.roomRentLimit && (
                                                <li className="flex items-center gap-2">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                    <p className="text-xs">
                                                        Room rent capped at{" "}
                                                        <strong>
                                                            ${p.roomRentLimit}
                                                            /day
                                                        </strong>
                                                    </p>
                                                </li>
                                            )}
                                            {p.familySizeLimit && (
                                                <li className="flex items-center gap-2">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                    <p className="text-xs">
                                                        Covers up to{" "}
                                                        <strong>
                                                            {p.familySizeLimit}{" "}
                                                            family members
                                                        </strong>
                                                    </p>
                                                </li>
                                            )}

                                            {/* Standard benefits */}
                                            {p.benefits &&
                                                p.benefits.map(
                                                    (benefit, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <svg
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="flex-shrink-0 mt-0.5"
                                                            >
                                                                <path
                                                                    d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                                                                    fill="currentColor"
                                                                />
                                                            </svg>
                                                            <p className="text-xs">
                                                                {benefit}
                                                            </p>
                                                        </li>
                                                    ),
                                                )}

                                            {/* Eligibility as a footer item */}
                                            {p.eligibility && (
                                                <li
                                                    className={`flex items-start gap-2 pt-2 border-t ${isFeatured ? "border-primary-foreground/20" : "border-border/50"}`}
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 18 18"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="flex-shrink-0 mt-0.5"
                                                    >
                                                        <path
                                                            d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                    <p className="text-xs">
                                                        {p.eligibility}
                                                    </p>
                                                </li>
                                            )}
                                        </ul>

                                        {/* Term badge */}
                                        <p
                                            className={`text-[10px] mt-4 font-semibold uppercase tracking-wider ${isFeatured ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}
                                        >
                                            {p.termYears} Year Term
                                        </p>

                                        {/* CTA Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePurchaseClick(p)
                                            }
                                            disabled={purchasingId === p._id}
                                            className={`text-sm w-full py-2.5 rounded-lg font-semibold mt-5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isFeatured
                                                    ? "bg-primary-foreground text-primary hover:opacity-90 shadow-sm"
                                                    : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                                            }`}
                                        >
                                            {purchasingId === p._id
                                                ? "Processing..."
                                                : user?.role === "customer"
                                                  ? "Purchase Coverage"
                                                  : "Sign Up to Buy"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* 6. Testimonials & Social Proof */}
            <section
                id="testimonials"
                className="py-20 px-4 bg-muted/20 border-t border-b border-border/60"
            >
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-3">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
                            Reviews
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Backed by Happy Families
                        </h2>
                        <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                            Read how policyholders settle their clinical
                            receipts using AegisCare.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
                            <div className="flex items-center space-x-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill="currentColor"
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed italic">
                                "Filing a dental claim took me exactly 3
                                minutes. Uploaded the receipt picture from my
                                dentist, and the money was credited to my
                                checking account the next day. Unbelievable
                                experience."
                            </p>
                            <div className="flex items-center space-x-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs">
                                    SM
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        Sarah Mitchell
                                    </h4>
                                    <span className="text-[9px] text-muted-foreground">
                                        Verified Health Shield policyholder
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
                            <div className="flex items-center space-x-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill="currentColor"
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed italic">
                                "I was skeptical about term life payouts being
                                100% digital, but AegisCare makes configurations
                                super simple. My coverage limits and payment
                                histories are extremely easy to audit."
                            </p>
                            <div className="flex items-center space-x-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs">
                                    DK
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        David Kovic
                                    </h4>
                                    <span className="text-[9px] text-muted-foreground">
                                        Verified Legacy Life policyholder
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
                            <div className="flex items-center space-x-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill="currentColor"
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed italic">
                                "No stacks of paper or annoying telephone
                                brokers. I created an account, toggled my age
                                slider, select a coverage plan, and got covered
                                instantly. Modern FinTech at its absolute best."
                            </p>
                            <div className="flex items-center space-x-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs">
                                    EL
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        Emma Liang
                                    </h4>
                                    <span className="text-[9px] text-muted-foreground">
                                        Verified Essential Health policyholder
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 7. CTA Banner */}
            <section className="py-16 px-4 max-w-5xl mx-auto w-full">
                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Protect Your Family's Health & Financial Future Today
                    </h2>
                    <p className="max-w-xl mx-auto text-primary-foreground/90 text-xs sm:text-sm">
                        Sign up now to execute instant secure digital
                        enrollment. AegisCare gives you complete audit
                        transparency and fast claims settlements.
                    </p>
                    <div className="pt-2 flex justify-center space-x-3">
                        <Link to="/register">
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-slate-50 font-bold text-xs rounded-xl shadow-md py-5 px-6"
                            >
                                Create Account
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={scrollToCalculator}
                            className="text-white hover:bg-white/10 font-bold text-xs py-5 px-6"
                        >
                            Estimate Premium
                        </Button>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 px-4 border-t border-slate-900 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 border-b border-slate-900 pb-12">
                    {/* Brand Col */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center space-x-2.5">
                            <span className="bg-primary p-1.5 rounded-lg text-white">
                                <Shield size={16} />
                            </span>
                            <span className="text-lg font-black text-white tracking-tight">
                                AegisCare
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                            AegisCare is a registered digital InsurTech agent
                            offering transparent, paperless, and claims-first
                            medical and term life coverages.
                        </p>
                    </div>

                    {/* Links Col 1 */}
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                            Product
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <a
                                    href="#plans"
                                    className="hover:text-white transition-colors"
                                >
                                    Health Care Plans
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#plans"
                                    className="hover:text-white transition-colors"
                                >
                                    Term Life Insurance
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#calculator"
                                    className="hover:text-white transition-colors"
                                >
                                    Premium Estimator
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links Col 2 */}
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                            Resources
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <a
                                    href="#calculator"
                                    className="hover:text-white transition-colors"
                                >
                                    Claims Filing Tutorial
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#features"
                                    className="hover:text-white transition-colors"
                                >
                                    Privacy & Data Security
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#testimonials"
                                    className="hover:text-white transition-colors"
                                >
                                    Verified Customer Reviews
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links Col 3 */}
                    <div className="space-y-3">
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                            Regulatory
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors"
                                >
                                    License: IRDAI/AGN/940B
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Regulatory disclaimer notice mockup */}
                <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-600 text-center md:text-left">
                    <div className="space-y-1.5 max-w-2xl">
                        <p>
                            * AegisCare Insurance product catalog details
                            displayed represent illustrative benefit outlines.
                            Final coverages, exclusions, and deductible clauses
                            are subject to the executed policy terms.
                        </p>
                        <p>
                            AegisCare InsurTech Operations Inc. holds an active
                            Insurance Agent License IRDAI/AGN/940B, subject to
                            periodic reviews. Secure credentials and payment
                            encryptions are fully SSL certified.
                        </p>
                    </div>
                    <p className="text-xs">
                        © {new Date().getFullYear()} AegisCare. All rights
                        reserved.
                    </p>
                </div>
            </footer>

            {/* Policy Purchase Dialog */}
            <Dialog
                open={showPurchaseDialog}
                onOpenChange={setShowPurchaseDialog}
            >
                <DialogContent className="sm:max-w-[425px] rounded-3xl bg-card border border-border shadow-2xl p-6">
                    <DialogHeader className="space-y-1.5">
                        <DialogTitle className="text-xl font-extrabold text-foreground">
                            Confirm Policy Purchase
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            You are subscribing to{" "}
                            <strong>{selectedPolicy?.title}</strong>. Please
                            provide the required details to complete enrollment.
                        </DialogDescription>
                    </DialogHeader>

                    {purchaseMessage && (
                        <div
                            className={`p-3 rounded-lg text-xs font-semibold ${purchaseMessage.type === "success" ? "bg-green-50 border border-green-100 text-green-700" : "bg-red-50 border border-red-100 text-red-700"}`}
                        >
                            {purchaseMessage.text}
                        </div>
                    )}

                    <div className="space-y-4 my-4">
                        <div className="bg-muted/30 p-4 rounded-2xl space-y-2 border border-border/50 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Premium:
                                </span>
                                <span className="font-bold text-foreground">
                                    ${selectedPolicy?.premium} /{" "}
                                    {selectedPolicy?.premiumFrequency?.toLowerCase() ||
                                        "month"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Coverage Amount:
                                </span>
                                <span className="font-bold text-foreground">
                                    $
                                    {selectedPolicy?.coverageAmount?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Term:
                                </span>
                                <span className="font-bold text-foreground">
                                    {selectedPolicy?.termYears} Year(s)
                                </span>
                            </div>
                        </div>

                        {/* Family Floater inputs */}
                        {selectedPolicy?.familySizeLimit && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground">
                                    Add Covered Family Members (Up to{" "}
                                    {selectedPolicy.familySizeLimit})
                                </label>
                                <div className="max-h-[160px] overflow-y-auto border border-border/80 rounded-xl p-3 bg-muted/10 space-y-2">
                                    {customersList.filter(
                                        (c) => c._id !== user?._id,
                                    ).length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            No other users found in the system
                                            to add.
                                        </p>
                                    ) : (
                                        customersList
                                            .filter((c) => c._id !== user?._id)
                                            .map((customer) => (
                                                <label
                                                    key={customer._id}
                                                    className="flex items-center space-x-2.5 p-1 hover:bg-muted/30 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                                        checked={coveredMembers.includes(
                                                            customer._id,
                                                        )}
                                                        disabled={
                                                            !coveredMembers.includes(
                                                                customer._id,
                                                            ) &&
                                                            coveredMembers.length >=
                                                                selectedPolicy.familySizeLimit
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                if (
                                                                    coveredMembers.length <
                                                                    selectedPolicy.familySizeLimit
                                                                ) {
                                                                    setCoveredMembers(
                                                                        [
                                                                            ...coveredMembers,
                                                                            customer._id,
                                                                        ],
                                                                    );
                                                                }
                                                            } else {
                                                                setCoveredMembers(
                                                                    coveredMembers.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            customer._id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <div className="text-xs">
                                                        <p className="font-semibold text-foreground">
                                                            {customer.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {customer.email}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Selected: {coveredMembers.length} /{" "}
                                    {selectedPolicy.familySizeLimit}
                                </p>
                            </div>
                        )}

                        {/* Term Life inputs */}
                        {selectedPolicy?.type === "life" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                    <span>Beneficiary Name (Nominee)</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">
                                        *Required
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Jane Doe (Spouse)"
                                    value={beneficiary}
                                    onChange={(e) =>
                                        setBeneficiary(e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowPurchaseDialog(false)}
                            className="w-full sm:w-auto font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handlePurchase(selectedPolicy?._id)}
                            disabled={
                                purchasingId === selectedPolicy?._id ||
                                (selectedPolicy?.type === "life" &&
                                    !beneficiary)
                            }
                            className="w-full sm:w-auto font-bold rounded-xl flex-1"
                        >
                            {purchasingId === selectedPolicy?._id
                                ? "Processing..."
                                : "Confirm & Purchase"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LandingPage;
