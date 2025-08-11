import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

/* ============ Design tokens ============ */
const T = {
  bg: "bg-black",
  surface: "bg-zinc-950",
  text: "text-white",
  sub: "text-zinc-300",
  border: "border-zinc-800",
  hairline: "border border-zinc-800",
  card: "bg-zinc-950",
  accent: "#ff0000",
  accentLight: "#ff6666",
}

/* ============ Utilities (asset helper) ============ */
const DEFAULT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'>
     <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
       <stop offset='0%' stop-color='%23ff6666'/><stop offset='100%' stop-color='%23ff0000'/>
     </linearGradient></defs>
     <rect fill='url(%23g)' width='100%' height='100%'/>
     <text x='50%' y='50%' fill='white' font-family='Arial, Helvetica, sans-serif' font-size='36' text-anchor='middle'>Heplink image</text>
   </svg>`
)}`

function useAssetUrl(bases, fallback = "") {
  const [url, setUrl] = useState(fallback)
  useEffect(() => {
    let alive = true
    ;(async () => {
      const exts = ["png", "jpg", "jpeg", "webp"]
      const list = (Array.isArray(bases) ? bases : [bases]).filter(Boolean)
      for (const base of list.length ? list : ["__nope__"]) {
        for (const ext of exts) {
          const u = `/${base}.${ext}`
          try {
            const r = await fetch(u, { method: "HEAD" })
            if (r.ok && alive) { setUrl(u); return }
          } catch {}
        }
      }
    })()
    return () => { alive = false }
  }, [JSON.stringify(bases)])
  return url
}

/* ============ Motion ============ */
const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const HoverLift = { whileHover: { y: -2, scale: 1.02 }, transition: { type: "spring", stiffness: 300, damping: 18 } }

/* ============ Helpers ============ */
const Section = ({ id, className = "", children }) => (
  <section id={id} className={`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
)

const Magnetic = ({ children }) => {
  const ref = useRef(null)
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        el.style.transform = `translate(${dx * 0.06}px, ${dy * 0.06}px)`
      }}
      onMouseLeave={() => { const el = ref.current; if (el) el.style.transform = "translate(0,0)" }}
      className="will-change-transform"
    >{children}</div>
  )
}

/* simple round cursor (no glow) */
const CursorDot = () => {
  useEffect(() => {
    const dot = document.createElement("div")
    dot.className = "cursor-dot"
    document.body.appendChild(dot)

    const move = (e) => { dot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)` }
    const enter = () => dot.classList.add("pointer")
    const leave = () => dot.classList.remove("pointer")

    window.addEventListener("mousemove", move)
    document.querySelectorAll('a,button,[role="button"]').forEach(el => {
      el.addEventListener("mouseenter", enter)
      el.addEventListener("mouseleave", leave)
    })
    return () => {
      window.removeEventListener("mousemove", move)
      dot.remove()
      document.querySelectorAll('a,button,[role="button"]').forEach(el => {
        el.removeEventListener("mouseenter", enter)
        el.removeEventListener("mouseleave", leave)
      })
    }
  }, [])
  return null
}

/* ============ Buttons (center text) ============ */
const btnBase = "rounded-xl h-10 px-5 flex items-center justify-center leading-none"
const AccentButton = ({ href, className = "", children }) => (
  <a href={href} className="inline-block">
    <Magnetic>
      <motion.div {...HoverLift}>
        <button className={`${btnBase} text-white transition-all duration-200 ${className}`} style={{ backgroundColor: T.accent, boxShadow: "0 10px 26px -12px rgba(255,0,0,.8)" }}>{children}</button>
      </motion.div>
    </Magnetic>
  </a>
)
const LightButton = ({ href, className = "", children }) => (
  <a href={href} className="inline-block">
    <Magnetic>
      <motion.div {...HoverLift}>
        <button className={`${btnBase} bg-white text-black hover:bg-zinc-100 border border-zinc-200 ${className}`}>{children}</button>
      </motion.div>
    </Magnetic>
  </a>
)
const OutlineButton = ({ href, className = "", children }) => (
  <a href={href} className="inline-block">
    <Magnetic>
      <motion.div {...HoverLift}>
        <button
          className={`${btnBase} border border-zinc-700 text-white hover:bg-zinc-900 transition-all duration-200 ${className}`}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px -12px rgba(255,0,0,.45)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0,0,0,0)")}
        >{children}</button>
      </motion.div>
    </Magnetic>
  </a>
)
const GhostLink = ({ href, children }) => (<a href={href} className="inline-flex items-center px-0 h-8" style={{ color: T.accent }}>{children}</a>)

/* ============ Navbar (mobile hamburger; bold logo text) ============ */
const NavLink = ({ href, label, onClick }) => (
  <a href={href} onClick={onClick} className="hover:text-white text-zinc-300 transition-colors" style={{ transition: "color .15s ease" }}>{label}</a>
)

const Logo = ({ onClick }) => (
  <a href="#/home" onClick={onClick} className="flex items-center gap-2">
    <img src="/logo.png" alt="Heplink" className="h-7 w-auto" onError={(e)=>{e.currentTarget.style.display='none'}} />
    <span className="leading-none text-white font-bold">Heplink</span>
  </a>
)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <div className={`sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/60 bg-black/80 border-b ${T.border}`}>
        <Section className="py-4 flex items-center justify-between">
          <Logo onClick={close} />
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-[15px]">
            <NavLink href="#/home" label="Home" />
            <NavLink href="#/work" label="Work" />
            <NavLink href="#/services" label="What we do" />
            <NavLink href="#/insights" label="Insights" />
            <NavLink href="#/careers" label="Careers" />
            <NavLink href="#/contact" label="Contact" />
          </nav>
          <div className="hidden sm:block">
            <AccentButton href="#/contact" className="hidden md:inline-flex">Let's talk</AccentButton>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700"
            aria-label="Toggle menu" aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </Section>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            className="fixed inset-0 z-50 bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: .25 }}
              className="absolute top-0 left-0 right-0 bg-black border-b border-zinc-800 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4 text-lg">
                <Logo onClick={close} />
                <NavLink href="#/home" label="Home" onClick={close} />
                <NavLink href="#/work" label="Work" onClick={close} />
                <NavLink href="#/services" label="What we do" onClick={close} />
                <NavLink href="#/insights" label="Insights" onClick={close} />
                <NavLink href="#/careers" label="Careers" onClick={close} />
                <NavLink href="#/contact" label="Contact" onClick={close} />
                <AccentButton href="#/contact">Let's talk</AccentButton>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============ Hero ============ */
const Hero = () => {
  const heroUrl = useAssetUrl(["hero-image", "heroImage"], DEFAULT_PLACEHOLDER)
  const bgStyle = useMemo(() => ({
    backgroundImage: `url(${heroUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  }), [heroUrl])

  return (
    <div className={`relative overflow-hidden border-b ${T.border}`} style={bgStyle}>
      <div className="absolute inset-0 bg-black/55" />
      <Section className="py-24 sm:py-32 relative z-10">
        <motion.div variants={fade} initial="hidden" animate="show" className="max-w-[820px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-300">Social-first creative partner</p>
          <h1 className="mt-4 text-4xl sm:text-[54px] leading-[1.05] font-bold tracking-tight text-white">
            Helping brands <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, #fff, ${T.accentLight})` }}>earn attention</span> in a social-first world.
          </h1>
          <p className="mt-5 text-[18px] leading-7 text-zinc-200 max-w-2xl">Strategy. Creative. Creators. Media. Integrated to turn communities into customers.</p>
          <div className="mt-8 flex items-center gap-3">
            <AccentButton href="#/work">See our work</AccentButton>
            <LightButton href="#/services">What we do</LightButton>
          </div>
        </motion.div>
      </Section>
    </div>
  )
}

/* ============ Our approach (mobile-safe buttons) ============ */
const Approach = () => {
  const [tab, setTab] = useState("how")
  const copy = {
    goal: { title: "Our goal", body: "Earn attention that drives growth. We blend brand + performance so social actually moves the numbers that matter." },
    how:  { title: "How we work", body: "Small team, fast feedback, data driven, and useful monthly insights you’ll actually use (like Spotify Wrapped for your marketing)." },
    proof:{ title: "Proof", body: "2M+ views each month, across multiple industries, and reporting that tells you what to do next. That’s the way we do it." }
  }
  const tabs = [
    { id: "goal", label: "Goal" },
    { id: "how",  label: "How we work" },
    { id: "proof", label: "Proof" },
  ]
  return (
    <Section id="approach" className="py-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our approach</h2>
        {/* Mobile-safe tab row */}
        <div className="flex gap-2 overflow-x-auto py-1 -mx-1 px-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 whitespace-nowrap px-3 h-9 rounded-lg border text-xs sm:text-sm ${tab===t.id ? 'border-red-500 text-white' : 'border-zinc-700 text-zinc-300'} bg-zinc-900`}
            >{t.label}</button>
          ))}
        </div>
      </div>
      <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.35}} className={`mt-6 p-6 rounded-2xl ${T.hairline} ${T.card}`}>
        <div className="text-sm uppercase tracking-[0.16em] text-zinc-400">{copy[tab].title}</div>
        <div className="mt-2 text-[18px] leading-7 text-zinc-200">{copy[tab].body}</div>
      </motion.div>
    </Section>
  )
}

/* ============ Service icons ============ */
const IconTrend = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 17l6-6 4 4 7-7"/><path d="M21 10V4h-6"/></svg>)
const IconSparkles = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>)
const IconMegaphone = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 10v4a2 2 0 0 0 2 2h2l4 3V5L7 8H5a2 2 0 0 0-2 2z"/></svg>)
const IconRocket = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M14 3l7 7-8 8-7-7z"/><path d="M5 19l3 3"/></svg>)

/* ============ Services ============ */
const services = [
  { title: "Strategy & Social", desc: "Audience, positioning, channel architecture, measurement frameworks.", icon: IconTrend },
  { title: "Creative & Content", desc: "Social-first ideas, production, creator collaborations, always-on.", icon: IconSparkles },
  { title: "Paid Media", desc: "Full-funnel planning, performance, attribution and optimisation.", icon: IconMegaphone },
  { title: "Campaigns", desc: "Moments that capture culture and earn attention at scale.", icon: IconRocket },
]
const Services = () => (
  <Section id="services" className="py-20">
    <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">What we do</h2>
      <p className="mt-3 text-zinc-300">People over platforms. Social work that moves business outcomes.</p>
    </motion.div>
    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {services.map((s, i) => (
        <motion.div key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -4, rotateX: 0.6, rotateY: 0.6 }} className={`relative rounded-2xl p-6 ${T.hairline} ${T.card} h-full transition-colors duration-200 hover:border-red-500/60 after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none after:ring-1 after:ring-transparent hover:after:ring-red-500/30`}>
          <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
            {React.createElement(s.icon, { className: "w-5 h-5 text-zinc-300" })}
            <span>{s.title}</span>
          </div>
          <p className="mt-2 text-[14px] text-zinc-400">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  </Section>
)

/* ============ Work ============ */
const workItems = [
  { key: "durham", img: "durham-image",   tag: "Campaign",       title: "Durham x Hummel", blurb: "Amplifying club culture and kit pride with creator-led social and launch content." },
  { key: "aspect", img: "aspect-bathrooms", tag: "Brand & Social", title: "Aspect Bathrooms", blurb: "Elevating a local brand with performance-driven social and sleek product storytelling." },
  { key: "onegovs", img: "onegovs-image", tag: "Strategy & Paid", title: "OneGovs", blurb: "Building awareness and trust for a public-sector platform through targeted creative + media." },
]
const CardImage = ({ base, alt }) => {
  const url = useAssetUrl(base, DEFAULT_PLACEHOLDER)
  return <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" />
}
const Work = () => (
  <Section id="work" className={`py-20 border-t ${T.border}`}>
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Selected work</h2>
        <p className="mt-3 text-zinc-300 max-w-xl">A taste of how brand + performance blend to move the numbers that matter.</p>
      </div>
      <OutlineButton href="#/contact" className="hidden sm:inline-flex">Start a project</OutlineButton>
    </div>

    <div className="mt-10 grid md:grid-cols-3 gap-6">
      {workItems.map((c) => (
        <motion.div key={c.key} whileHover={{ y: -6, rotateX: 1.2, rotateY: -1.2 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className={`group overflow-hidden ${T.hairline} rounded-2xl ${T.card} transition-colors hover:border-red-500/60 relative after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none after:ring-1 after:ring-transparent hover:after:ring-red-500/30`} style={{ transformStyle: "preserve-3d" }}>
          <div className="relative h-56 bg-zinc-900">
            <CardImage base={c.img} alt={c.title} />
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">{c.tag}</div>
            <div className="text-[20px] leading-snug text-white font-semibold mt-1">{c.title}</div>
            <div className="text-[14px] text-zinc-300 mt-2">{c.blurb}</div>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="mt-8"><GhostLink href="#/work">See more case studies →</GhostLink></div>
  </Section>
)

/* ============ Community / Insights / Careers / Contact / Footer ============ */
const Community = () => (
  <div id="community" className={`relative overflow-hidden border-y ${T.border}`}>
    <Section className="py-20">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Heplink Pulse</h3>
          <p className="mt-3 text-zinc-300">A weekly signal on what actually matters in social — trends, formats, and tactics you can use.</p>
          <form className="mt-6 flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Your email" type="email" className="w-full max-w-sm border border-zinc-700 rounded-xl px-3 py-2 outline-none bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2" />
            <button className={`${btnBase} text-white`} style={{ backgroundColor: T.accent }}>Join</button>
          </form>
          <p className="mt-2 text-[12px] text-zinc-500">No spam. Unsubscribe anytime.</p>
        </motion.div>
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className={`rounded-2xl p-6 ${T.hairline} ${T.card}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-white">Latest Pulse</div>
          <h4 className="mt-3 text-[18px] font-semibold text-white">Creative that converts: short-form edits that actually move the funnel</h4>
          <ul className="mt-4 space-y-3 text-[14px] text-zinc-300 list-disc pl-5">
            <li>Platform shift: captions + hooks that keep watch time</li>
            <li>Creator collabs: smaller creators, bigger trust</li>
            <li>Attribution: simple frameworks that clients get</li>
          </ul>
          <OutlineButton href="#/insights" className="mt-6">Read more</OutlineButton>
        </motion.div>
      </div>
    </Section>
  </div>
)

/* News images wired:
   - 'dogbonfire.(png|webp)' for the bonfire post
   - 'gst.(png|jpg|jpeg)' for the haulage post
*/
const posts = [
  { title: "Raising awareness & helping dog owners in the run up to Bonfire Night", tag: "News",   img: "dogbonfire" },
  { title: "Making a regional haulage company stand out",                           tag: "News",   img: "gst" },
  { title: "Durham x Hummel: from kit launch to community hype",                   tag: "Insight", img: "durham-image" },
]
const PostImage = ({ base, alt }) => {
  const url = useAssetUrl(base || "__none__", DEFAULT_PLACEHOLDER)
  return <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" />
}
const Insights = () => (
  <Section id="insights" className="py-20">
    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">News & insights</h3>
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      {posts.map((p, i) => (
        <div key={i} className={`rounded-2xl overflow-hidden ${T.hairline} ${T.card} relative after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none after:ring-1 after:ring-transparent hover:after:ring-red-500/30`}>
          <div className="h-44 bg-zinc-900">
            <PostImage base={p.img} alt={p.title} />
          </div>
          <div className="p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">{p.tag}</div>
            <div className="mt-1 text-[20px] leading-snug font-semibold text-white">{p.title}</div>
            <GhostLink href="#/insights">Read →</GhostLink>
          </div>
        </div>
      ))}
    </div>
  </Section>
)

const Careers = () => (
  <Section id="careers" className={`py-20 border-t ${T.border}`}>
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Culture & careers</h3>
        <p className="mt-3 text-zinc-300">We’re a team of platform natives, creators and marketers who love solving hard problems. Sound like you?</p>
        <div className="mt-6 flex gap-3">
          <AccentButton href="#/careers">See open roles</AccentButton>
          <OutlineButton href="#/careers">Life here</OutlineButton>
        </div>
      </div>
      <div className={`rounded-2xl p-6 ${T.hairline} ${T.card}`}>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[{ n: "200+", l: "projects shipped" }, { n: "4", l: "core capabilities" }, { n: "10y", l: "in social" }].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white">{s.n}</div>
              <div className="text-sm text-zinc-400">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
)

const Contact = () => (
  <Section id="contact" className="py-20">
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Got a brief?</h3>
        <p className="mt-3 text-zinc-300">Tell us what you’re trying to achieve. We’ll reply within two working days.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-zinc-400">General</div>
            <div className="font-medium text-white">hello@heplink.co</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">New business</div>
            <div className="font-medium text-white">newbiz@heplink.co</div>
          </div>
        </div>
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Name" className="border border-zinc-700 rounded-xl px-3 py-2 bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2" />
          <input placeholder="Email" className="border border-zinc-700 rounded-xl px-3 py-2 bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2" />
        </div>
        <input placeholder="Company" className="w-full border border-zinc-700 rounded-xl px-3 py-2 bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2" />
        <textarea placeholder="Tell us about your project" rows={5} className="w-full border border-zinc-700 rounded-xl px-3 py-2 bg-zinc-900 text-white placeholder-zinc-500 focus:ring-2" />
        <button className={`${btnBase} text-white`} style={{ backgroundColor: T.accent }}>Send</button>
      </form>
    </div>
  </Section>
)

const Footer = () => (
  <footer className={`border-t ${T.border}`}>
    <Section className="py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
      <div>
        <Logo />
        <p className="mt-3 text-zinc-400">Born social. Built for outcomes.</p>
      </div>
      <div>
        <div className="text-zinc-500">Services</div>
        <ul className="mt-3 space-y-2">
          <li><a href="#/services" className="hover:underline text-white">Strategy</a></li>
          <li><a href="#/services" className="hover:underline text-white">Creative</a></li>
          <li><a href="#/services" className="hover:underline text-white">Media</a></li>
          <li><a href="#/services" className="hover:underline text-white">Campaigns</a></li>
        </ul>
      </div>
      <div>
        <div className="text-zinc-500">Company</div>
        <ul className="mt-3 space-y-2">
          <li><a href="#/home" className="hover:underline text-white">Home</a></li>
          <li><a href="#/work" className="hover:underline text-white">Work</a></li>
          <li><a href="#/careers" className="hover:underline text-white">Careers</a></li>
          <li><a href="#/insights" className="hover:underline text-white">Insights</a></li>
          <li><a href="#/contact" className="hover:underline text-white">Contact</a></li>
        </ul>
      </div>
      <div>
        <div className="text-zinc-500">Legal</div>
        <ul className="mt-3 space-y-2">
          <li><a href="#" className="hover:underline text-white">Privacy</a></li>
          <li><a href="#" className="hover:underline text-white">Cookies</a></li>
        </ul>
      </div>
    </Section>
    <div className="text-xs text-zinc-500 text-center pb-8">© {new Date().getFullYear()} Heplink. All rights reserved.</div>
  </footer>
)

/* ============ Pages / Router (Approach moved below Services) ============ */
const HomePage = () => (<><Hero /><Services /><Approach /><Work /><Community /><Insights /></>)
const Page = ({ route }) => {
  if (route.startsWith("#/work")) return (<><Work /><Community /></>)
  if (route.startsWith("#/services")) return (<><Services /><Work /></>)
  if (route.startsWith("#/insights")) return (<Insights />)
  if (route.startsWith("#/careers")) return (<Careers />)
  if (route.startsWith("#/contact")) return (<Contact />)
  return (<HomePage />)
}

export default function App(){
  const [route, setRoute] = useState(typeof window !== "undefined" ? window.location.hash || "#/home" : "#/home")
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/home")
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  return (
    <div className={`min-h-screen ${T.bg} ${T.text} relative`}>
      <CursorDot />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }} exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}>
          <Page route={route} />
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
