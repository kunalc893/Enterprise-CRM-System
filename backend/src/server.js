import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

const stages = ["Prospecting", "Qualified", "Proposal", "Negotiation", "Won"];
const contacts = [
  {
    id: "c1",
    name: "Olivia Bennett",
    company: "Northstar Labs",
    title: "VP of Product",
    email: "olivia@northstarlabs.com",
    source: "Referral",
  },
  {
    id: "c2",
    name: "Ethan Cole",
    company: "Arcade Systems",
    title: "Operations Director",
    email: "ethan@arcadesystems.com",
    source: "Website",
  },
  {
    id: "c3",
    name: "Sophia Malik",
    company: "Lumen Works",
    title: "Founder",
    email: "sophia@lumenworks.io",
    source: "Event",
  },
];
let deals = [
  {
    id: "d1",
    contactId: "c1",
    name: "Northstar Labs – Growth",
    company: "Northstar Labs",
    value: 48000,
    stage: "Negotiation",
    owner: "Alex Kim",
    closeDate: "Oct 15",
    probability: 75,
  },
  {
    id: "d2",
    contactId: "c2",
    name: "Arcade Systems – Team",
    company: "Arcade Systems",
    value: 32000,
    stage: "Proposal",
    owner: "Alex Kim",
    closeDate: "Oct 22",
    probability: 60,
  },
  {
    id: "d3",
    contactId: "c3",
    name: "Lumen Works – Starter",
    company: "Lumen Works",
    value: 12000,
    stage: "Qualified",
    owner: "Jamie Lee",
    closeDate: "Nov 05",
    probability: 40,
  },
  {
    id: "d4",
    name: "Signal Ridge – Enterprise",
    company: "Signal Ridge",
    value: 86000,
    stage: "Prospecting",
    owner: "Alex Kim",
    closeDate: "Nov 18",
    probability: 20,
  },
  {
    id: "d5",
    contactId: "c1",
    name: "Northstar Labs – Pilot",
    company: "Northstar Labs",
    value: 18000,
    stage: "Won",
    owner: "Jamie Lee",
    closeDate: "Sep 18",
    probability: 100,
  },
];
let activities = [
  {
    id: 1,
    kind: "call",
    text: "Call completed with Olivia Bennett",
    meta: "Northstar Labs · 18 min",
    time: "12 min ago",
  },
  {
    id: 2,
    kind: "deal",
    text: "Deal moved to Negotiation",
    meta: "Northstar Labs – Growth · $48,000",
    time: "1 hr ago",
  },
  {
    id: 3,
    kind: "email",
    text: "Proposal sent to Ethan Cole",
    meta: "Arcade Systems · $32,000",
    time: "3 hrs ago",
  },
];

const requireRole =
  (...roles) =>
  (req, res, next) => {
    const role = req.user?.role || "Sales Representative";
    if (!roles.includes(role))
      return res
        .status(403)
        .json({ message: "Your role does not have access to this action." });
    next();
  };

app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database: mongoose.connection.readyState ? "connected" : "demo mode",
  }),
);
app.post("/api/auth/demo-login", (req, res) => {
  const user = { id: "u1", name: "Alex Kim", role: req.body.role || "Manager" };
  res.json({
    user,
    token: jwt.sign(user, process.env.JWT_SECRET || "development-secret", {
      expiresIn: "8h",
    }),
  });
});
app.get("/api/dashboard", (req, res) => {
  const openDeals = deals.filter((deal) => deal.stage !== "Won");
  res.json({
    pipelineValue: openDeals.reduce((sum, deal) => sum + deal.value, 0),
    dealsClosing: openDeals.filter((deal) => deal.probability >= 60).length,
    conversionRate: 28.4,
    newLeads: 18,
    stageTotals: stages.map((stage) => ({
      stage,
      count: deals.filter((deal) => deal.stage === stage).length,
      value: deals
        .filter((deal) => deal.stage === stage)
        .reduce((sum, deal) => sum + deal.value, 0),
    })),
    activities,
  });
});
app.get("/api/deals", (req, res) => res.json(deals));
app.post(
  "/api/deals",
  requireRole("Admin", "Manager", "Sales Representative"),
  (req, res) => {
    const deal = { id: `d${Date.now()}`, probability: 10, ...req.body };
    deals = [deal, ...deals];
    activities = [
      {
        id: Date.now(),
        kind: "deal",
        text: `New deal created: ${deal.name}`,
        meta: `${deal.company} · $${deal.value.toLocaleString()}`,
        time: "now",
      },
      ...activities,
    ];
    res.status(201).json(deal);
  },
);
app.patch(
  "/api/deals/:id/stage",
  requireRole("Admin", "Manager", "Sales Representative"),
  (req, res) => {
    const index = deals.findIndex((deal) => deal.id === req.params.id);
    if (index === -1)
      return res.status(404).json({ message: "Deal not found" });
    deals[index] = {
      ...deals[index],
      stage: req.body.stage,
      probability: req.body.probability ?? deals[index].probability,
    };
    res.json(deals[index]);
  },
);
app.get("/api/contacts", (req, res) => res.json(contacts));
app.get("/api/activities", (req, res) => res.json(activities));

const port = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nexus-crm")
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("Starting in demo mode without MongoDB"));
app.listen(port, () => console.log(`Nexus CRM API listening on ${port}`));
