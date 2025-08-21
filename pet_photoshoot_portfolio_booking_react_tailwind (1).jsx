import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, PawPrint, Calendar, Mail, Phone, MapPin, CheckCircle2, ImageIcon, DollarSign, Star, Instagram, Facebook, Send } from "lucide-react";

// --- Helper: currency formatter ---
const money = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

// --- Sample portfolio images (replace with your own) ---
const GALLERY = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568572933382-74d440642117?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530281690372-382f87f1ab66?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop",
];

// --- Services / Packages ---
const PACKAGES = [
  {
    id: "mini",
    name: "Mini Session",
    price: 149,
    includes: ["30 minutes", "10 edited photos", "1 pet", "Online gallery"],
  },
  {
    id: "classic",
    name: "Classic Session",
    price: 299,
    includes: ["60 minutes", "25 edited photos", "Up to 2 pets", "2 locations or backdrops", "Online gallery + print rights"],
    featured: true,
  },
  {
    id: "deluxe",
    name: "Deluxe Session",
    price: 499,
    includes: ["120 minutes", "All best shots (60+)", "Multiple pets", "Studio-style lighting kit", "Keepsake photo book"],
  },
];

// --- Utility: create ICS file content for calendar hold ---
function buildICS({ title, description, start, durationMins = 60, location }) {
  const dtStart = start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtEnd = new Date(start.getTime() + durationMins * 60000)
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PetShoot//EN\nBEGIN:VEVENT\nUID:${Date.now()}@petshoot.local\nDTSTAMP:${dtStart}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${title}\nDESCRIPTION:${description}\nLOCATION:${location || "TBD"}\nEND:VEVENT\nEND:VCALENDAR`;
}

function downloadFile(filename, content, type = "text/calendar") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Booking Form Component ---
function BookingForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [pkg, setPkg] = useState(PACKAGES[1].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedPkg = useMemo(() => PACKAGES.find(p => p.id === pkg), [pkg]);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    // Compose an email via mailto (replace address below)
    const subject = encodeURIComponent(`Pet Photoshoot Inquiry – ${pkg.toUpperCase()} – ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nPet: ${petName} (${petType})\nPackage: ${selectedPkg?.name} (${money(selectedPkg?.price || 0)})\nRequested Date/Time: ${date} ${time}\nNotes: ${notes}`
    );
    const businessEmail = "bookings@yourstudio.com"; // <-- change to your email
    const href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
    window.location.href = href;

    // Also offer an .ics hold for the client's calendar
    if (date && time) {
      const dt = new Date(`${date}T${time}:00`);
      const ics = buildICS({
        title: `Pet Photoshoot Hold – ${name}`,
        description: `${selectedPkg?.name} with ${petName} (${petType}). We will confirm by email.`,
        start: dt,
        durationMins: selectedPkg?.id === "mini" ? 30 : selectedPkg?.id === "deluxe" ? 120 : 60,
        location: "TBD",
      });
      downloadFile("pet-photoshoot-hold.ics", ics);
    }
  }

  return (
    <div id="booking" className="max-w-3xl mx-auto">
      <div className="bg-white/80 backdrop-blur border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Book a Session</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Your Name</span>
              <input required value={name} onChange={(e)=>setName(e.target.value)} className="border rounded-xl p-3" placeholder="Alex Doe" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Email</span>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="border rounded-xl p-3" placeholder />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Phone (optional)</span>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="border rounded-xl p-3" placeholder="(555) 555-5555" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Package</span>
              <select value={pkg} onChange={(e)=>setPkg(e.target.value)} className="border rounded-xl p-3">
                {PACKAGES.map(p => (
                  <option key={p.id} value={p.id}>{p.name} – {money(p.price)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Pet Name</span>
              <input value={petName} onChange={(e)=>setPetName(e.target.value)} className="border rounded-xl p-3" placeholder="Mochi" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Pet Type</span>
              <select value={petType} onChange={(e)=>setPetType(e.target.value)} className="border rounded-xl p-3">
                {"Dog,Cat,Rabbit,Bird,Reptile,Other".split(",").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Preferred Date</span>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border rounded-xl p-3" />
            </label>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Preferred Time</span>
              <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} className="border rounded-xl p-3" />
            </label>
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-sm">Location (optional)</span>
                <input className="border rounded-xl p-3" placeholder="Park, home studio, etc." />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Instagram (optional)</span>
                <input className="border rounded-xl p-3" placeholder="@yourhandle" />
              </label>
            </div>
          </div>
          <label className="grid gap-1">
            <span className="text-sm">Notes</span>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="border rounded-xl p-3 min-h-[100px]" placeholder="Tell us about your pet, any special needs, favorite treats, etc." />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-black text-white hover:opacity-90 transition">
            <Send className="w-4 h-4" /> Submit Inquiry
          </button>
          {submitted && (
            <p className="flex items-center gap-2 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4"/> Thanks! An email draft just opened. We also downloaded a calendar hold for you.</p>
          )}
        </form>
      </div>
    </div>
  );
}

// --- Pricing Cards ---
function Pricing() {
  return (
    <section id="pricing" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-bold">Packages & Pricing</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border p-6 bg-white/80 backdrop-blur shadow-sm ${p.featured ? "ring-2 ring-black" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <span className="text-lg font-bold">{money(p.price)}</span>
              </div>
              <ul className="space-y-2 mt-4 text-sm">
                {p.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {item}</li>
                ))}
              </ul>
              <a href="#booking" className="mt-6 inline-flex rounded-2xl px-4 py-2 bg-black text-white">Book {p.name}</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Gallery ---
function Gallery() {
  return (
    <section id="portfolio" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-bold">Portfolio</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <img src={src} alt={`Pet photo ${i+1}`} className="w-full h-64 object-cover rounded-2xl border shadow-sm" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Testimonials ---
function Testimonials() {
  const items = [
    { name: "Taylor & Mochi", text: "Absolutely obsessed! Patient, playful, and the photos are stunning.", rating: 5 },
    { name: "Jordan & Nala", text: "They captured Nala’s goofy side and her sweet cuddles. 10/10!", rating: 5 },
    { name: "Sam & Pico", text: "Professional, quick, and thoughtful with shy pets.", rating: 5 },
  ];
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-bold">Happy Humans (and Pets)</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl border p-6 bg-white/80 backdrop-blur shadow-sm">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-black" />
                ))}
              </div>
              <p className="text-sm">“{t.text}”</p>
              <p className="mt-3 text-sm font-medium">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- FAQ ---
function FAQ() {
  const faqs = [
    { q: "Do you work with all pets?", a: "Yes! Dogs, cats, rabbits, birds, reptiles — we love them all. We tailor the session to your pet’s comfort." },
    { q: "Where do shoots happen?", a: "We offer in-home, outdoor parks, and pop-up studio setups. We’ll help you choose the best option." },
    { q: "How do we get our photos?", a: "You’ll receive an online gallery to download and order prints. Turnaround is typically 1–2 weeks." },
  ];
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-2xl border p-4 bg-white/80 backdrop-blur shadow-sm">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="py-10 border-t bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <span className="font-semibold">Pawtrait Studio</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href="mailto:bookings@yourstudio.com" className="inline-flex items-center gap-2"><Mail className="w-4 h-4"/> bookings@yourstudio.com</a>
          <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4"/> (555) 123-4567</span>
          <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4"/> Your City</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" aria-label="Instagram"><Instagram className="w-5 h-5"/></a>
          <a href="#" aria-label="Facebook"><Facebook className="w-5 h-5"/></a>
        </div>
      </div>
    </footer>
  );
}

export default function PetPhotoshootSite() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-semibold"><PawPrint className="w-6 h-6"/> Pawtrait Studio</a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#portfolio" className="hover:underline">Portfolio</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#booking" className="hover:underline">Book</a>
            <a href="#faq" className="hover:underline" onClick={(e)=>{
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}>FAQ</a>
          </nav>
          <a href="#booking" className="hidden md:inline-flex rounded-2xl px-4 py-2 bg-black text-white">Book Now</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1 initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="text-4xl md:text-6xl font-extrabold leading-tight">
              Pet Photos that <span className="underline decoration-wavy decoration-amber-400">feel</span> like your best friend
            </motion.h1>
            <p className="mt-4 text-gray-700 max-w-prose">Portfolio-worthy portraits and playful candids — tailored for your pet’s personality. Book online, choose a package, and we’ll handle the treats.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#booking" className="inline-flex rounded-2xl px-5 py-3 bg-black text-white">Book a Session</a>
              <a href="#portfolio" className="inline-flex rounded-2xl px-5 py-3 border">View Portfolio</a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Gentle, pet-first approach</div>
              <div className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Fast turnarounds</div>
            </div>
          </div>
          <motion.div initial={{opacity:0, scale:0.98}} whileInView={{opacity:1, scale:1}} viewport={{once:true}} className="grid grid-cols-3 gap-3">
            {GALLERY.slice(0,6).map((src, i) => (
              <img key={i} src={src} alt="Pet" className={`rounded-2xl border shadow-sm object-cover h-28 md:h-40 w-full ${i%3===0?"col-span-2":""}`} />
            ))}
          </motion.div>
        </div>
      </section>

      <Gallery />
      <Pricing />

      <section id="booking" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <BookingForm />
        </div>
      </section>

      <section id="faq"><FAQ /></section>
      <Testimonials />
      <Footer />
    </div>
  );
}
