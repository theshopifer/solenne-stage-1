import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import AssetLibrary from "@/components/AssetLibrary";
import StorefrontStudio from "@/components/StorefrontStudio";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Compass,
  FileText,
  Flower2,
  LayoutTemplate,
  Search,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";

const RAW_GUIDES = import.meta.glob("../content/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const guideMeta = [
  { id: "overview", nav: "Stage 1 overview", title: "Stage 1 in Full: Store Design (4–6 weeks)", overline: "THE MASTER ROADMAP", icon: Compass },
  { id: "week-1", nav: "Setup & the admin", title: "Week 1: Setup and Learning the Admin", overline: "WEEK ONE · GET ORIENTED", icon: BookOpen },
  { id: "week-2", nav: "Products & images", title: "Week 2: Products, Data and Images", overline: "WEEK TWO · MAKE THE MATERIALS", icon: Sprout },
  { id: "week-3", nav: "The brand system", title: "Week 3: Brand System in the Theme", overline: "WEEK THREE · BUILD A VISUAL LANGUAGE", icon: Flower2 },
  { id: "week-4", nav: "Storefront pages", title: "Week 4: Homepage, Product and Collection Pages", overline: "WEEK FOUR · SHAPE THE STOREFRONT", icon: FileText },
  { id: "week-5", nav: "Pages, search & AI", title: "Week 5: Pages, Navigation, Search and AI Experiments", overline: "WEEK FIVE · CONNECT THE EXPERIENCE", icon: Compass },
  { id: "week-6", nav: "QA, portfolio & selling", title: "Week 6: QA, Numbers, Portfolio and Selling", overline: "WEEK SIX · FINISH WITH PROOF", icon: CheckCircle2 },
  { id: "prompts", nav: "Image & SVG prompts", title: "SOLENNE: Complete Image and SVG Prompt Library", overline: "THE CREATIVE ASSET LIBRARY", icon: Sparkles },
];

const guides = Object.entries(RAW_GUIDES)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, content], index) => ({ ...guideMeta[index], path, content }));

const STORAGE = {
  chapters: "store-design-field-guide:chapters:v1",
  tasks: "store-design-field-guide:tasks:v1",
};

type TaskMap = Record<string, boolean>;

function readSaved<T,>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getExcerpt(content: string, needle: string) {
  const haystack = content.toLowerCase();
  const at = haystack.indexOf(needle.toLowerCase());
  if (at < 0) return "Open guide";
  return `…${content.slice(Math.max(0, at - 52), Math.min(content.length, at + 110)).replace(/\s+/g, " ")}…`;
}

function App() {
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") return "overview";
    const id = window.location.hash.match(/^#guide\/([^?]+)/)?.[1];
    return guides.some((guide) => guide.id === id) ? id! : "overview";
  });
  const [completed, setCompleted] = useState<string[]>(() => readSaved(STORAGE.chapters, []));
  const [taskMap, setTaskMap] = useState<TaskMap>(() => readSaved(STORAGE.tasks, {}));
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(() => typeof window !== "undefined" && window.location.hash === "#studio/templates");
  const readerRef = useRef<HTMLDivElement>(null);
  const active = guides.find((guide) => guide.id === activeId) ?? guides[0];

  useEffect(() => {
    window.localStorage.setItem(STORAGE.chapters, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    const syncTasks = () => setTaskMap(readSaved(STORAGE.tasks, {}));
    window.addEventListener("field-guide-task-change", syncTasks);
    return () => window.removeEventListener("field-guide-task-change", syncTasks);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const root = readerRef.current;
    if (!root || !active) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }
    let taskIndex = 0;
    for (const node of textNodes) {
      const original = node.nodeValue ?? "";
      if (!original.includes("☐") || !node.parentNode) continue;
      const segments = original.split("☐");
      if (segments.length < 2) continue;
      const fragment = document.createDocumentFragment();
      const listItem = node.parentElement?.closest("li");
      const tableRow = node.parentElement?.closest("tr");
      const accessibleLabel = (listItem?.textContent ?? tableRow?.textContent ?? original).replaceAll("☐", "").replace(/\s+/g, " ").trim();
      segments.forEach((segment, segmentIndex) => {
        if (segment) fragment.append(document.createTextNode(segment));
        if (segmentIndex < segments.length - 1) {
          const key = `${active.id}:task:${taskIndex++}`;
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "source-task-checkbox";
          checkbox.checked = Boolean(taskMap[key]);
          checkbox.setAttribute("aria-label", `Mark complete: ${accessibleLabel || "checklist item"}`);
          checkbox.title = accessibleLabel || "Mark checklist item complete";
          checkbox.addEventListener("change", () => {
            const updated = readSaved<TaskMap>(STORAGE.tasks, {});
            updated[key] = checkbox.checked;
            window.localStorage.setItem(STORAGE.tasks, JSON.stringify(updated));
            window.dispatchEvent(new Event("field-guide-task-change"));
          });
          fragment.append(checkbox);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    }
  }, [active.id, active.content, taskMap]);

  const totalTasks = useMemo(
    () => guides.reduce((total, guide) => total + (guide.content.match(/☐/g)?.length ?? 0), 0),
    [],
  );
  const checkedTasks = Object.values(taskMap).filter(Boolean).length;
  const progress = Math.round((completed.length / guides.length) * 100);
  const matches = query.trim()
    ? guides.filter((guide) => `${guide.title} ${guide.content}`.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const selectGuide = (id: string) => {
    setActiveId(id);
    setStudioOpen(false);
    setSearchOpen(false);
    setQuery("");
    window.history.replaceState(null, "", `#guide/${id}`);
    window.setTimeout(() => document.getElementById("reader-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const selectStudio = () => {
    setStudioOpen(true);
    setSearchOpen(false);
    setQuery("");
    window.history.replaceState(null, "", "#studio/templates");
    window.setTimeout(() => document.getElementById("storefront-studio")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const toggleComplete = () => {
    setCompleted((current) => current.includes(active.id)
      ? current.filter((id) => id !== active.id)
      : [...current, active.id]);
  };

  const isComplete = completed.includes(active.id);

  return (
    <div className="site-frame">
      <header className="topbar">
        <a className="brand-lockup" href="#guide/overview" onClick={(event) => { event.preventDefault(); selectGuide("overview"); }} aria-label="The Store Design Field Guide home">
          <span className="brand-mark"><span>S</span></span>
          <span className="brand-type"><strong>FIELDNOTES</strong><small>BY SOLENNE STUDIO</small></span>
        </a>
        <div className="topbar-center"><span className="topbar-dot" /> A guided practice in thoughtful commerce</div>
        <div className="topbar-tools">
          <div className={`search-wrap ${searchOpen ? "is-open" : ""}`}>
            {searchOpen ? (
              <>
                <Search size={17} aria-hidden="true" />
                <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the full field guide…" aria-label="Search the full field guide" onKeyDown={(event) => { if (event.key === "Escape") { setSearchOpen(false); setQuery(""); } if (event.key === "Enter" && matches[0]) selectGuide(matches[0].id); }} />
                <button className="icon-button search-close" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X size={16} /></button>
                {query.trim() && <div className="search-results" role="listbox" aria-label="Search results">
                  {matches.length ? matches.map((guide) => <button key={guide.id} className="search-result" onClick={() => selectGuide(guide.id)} role="option">
                    <span className="search-result-title">{guide.title}</span><span className="search-excerpt">{getExcerpt(guide.content, query.trim())}</span>
                  </button>) : <p className="search-empty">No matches in this guide. Try another phrase.</p>}
                </div>}
              </>
            ) : (
              <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={16} /><span>Search the guide</span><kbd>⌘ K</kbd></button>
            )}
          </div>
          <span className="top-progress"><span className="top-progress-label">YOUR PROGRESS</span><strong>{progress}%</strong></span>
        </div>
      </header>

      <div className="workspace">
        <aside className="left-rail" aria-label="Curriculum navigation">
          <div className="rail-kicker">THE LEARNING PATH</div>
          <button className={`nav-link overview-link ${active.id === "overview" ? "active" : ""}`} onClick={() => selectGuide("overview")}>
            <span className="nav-icon overview-icon"><Compass size={16} /></span><span className="nav-copy"><strong>Start here</strong><small>Stage 1 overview</small></span>
            <ChevronRight size={14} className="nav-chevron" />
          </button>
          <div className="nav-divider"><span>THE SIX-WEEK BUILD</span><span>01—06</span></div>
          <nav className="week-nav">
            {guides.slice(1, 7).map((guide, index) => {
              const Icon = guide.icon;
              const done = completed.includes(guide.id);
              return <button key={guide.id} className={`nav-link ${active.id === guide.id ? "active" : ""} ${done ? "is-done" : ""}`} onClick={() => selectGuide(guide.id)}>
                <span className="week-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="nav-copy"><strong>{guide.nav}</strong><small>{["Get oriented", "Make the materials", "Create the visual system", "Build the storefront", "Connect the experience", "Prove the work"][index]}</small></span>
                {done ? <Check size={15} className="nav-done" /> : <Icon size={15} className="nav-muted-icon" />}
              </button>;
            })}
          </nav>
          <div className="nav-divider studio-divider"><span>DESIGN IN PRACTICE</span></div>
          <button className={`nav-link studio-link ${studioOpen ? "active" : ""}`} onClick={selectStudio} aria-current={studioOpen ? "page" : undefined}>
            <span className="nav-icon studio-icon"><LayoutTemplate size={15} /></span><span className="nav-copy"><strong>Storefront examples</strong><small>Page templates in action</small></span>
            <ChevronRight size={14} className="nav-chevron" />
          </button>
          <div className="nav-divider resource-divider"><span>KEEP CLOSE</span></div>
          <button className={`nav-link resource-link ${active.id === "prompts" ? "active" : ""}`} onClick={() => selectGuide("prompts")}>
            <span className="nav-icon resource-icon"><Sparkles size={15} /></span><span className="nav-copy"><strong>Image & SVG library</strong><small>66 visual assets + prompts</small></span>
            <ChevronRight size={14} className="nav-chevron" />
          </button>
          <div className="rail-note"><span className="rail-note-icon"><Sprout size={16} /></span><p><strong>Learn by making.</strong><br />Every lesson ends in something real.</p></div>
          <div className="rail-footer">A SOLENNE STUDIO FIELD GUIDE <span>·</span> V.01</div>
        </aside>

        <main className="main-column">
          <section className="hero-card" aria-label="Field guide introduction">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> THE STOREFRONT PRACTICE <span className="eyebrow-year">2026 EDITION</span></div>
              <h1>Build with <em>intention.</em><br />Learn by doing.</h1>
              <p>A considered, step-by-step path from a blank Shopify store to a polished storefront, a portfolio case study, and your first clear offer.</p>
              <button className="hero-cta" onClick={() => selectGuide("overview")}><span>Explore the full roadmap</span><ArrowDownRight size={16} /></button>
              <div className="hero-details"><span><Clock3 size={14} /> 4–6 weeks</span><i /> <span>42 days of practice</span></div>
            </div>
            <div className="hero-visual">
              <img src="/manus-storage/solenne-hero-desktop_43404e97.webp" alt="SOLENNE skincare range displayed in warm natural light" />
              <div className="image-caption"><span>THE SOLENNE STUDY</span><span>01 / 06</span></div>
              <div className="image-seal"><span>LEARN</span><Flower2 size={15} /><span>MAKE</span></div>
            </div>
            <div className="hero-index">A FIELD GUIDE FOR<br /><b>STORE DESIGN</b></div>
          </section>

          <section className="journey-strip" aria-label="Six-week learning path">
            <div className="journey-heading"><span className="section-label">THE BUILD, IN SIX CHAPTERS</span><span className="journey-caption">Follow the sequence, or jump to what you need.</span></div>
            <div className="journey-weeks">
              {guides.slice(1, 7).map((guide, index) => <button key={guide.id} className={`journey-week ${active.id === guide.id ? "selected" : ""} ${completed.includes(guide.id) ? "done" : ""}`} onClick={() => selectGuide(guide.id)} aria-label={`Open Week ${index + 1}: ${guide.nav}`}>
                <span className="journey-week-index">WEEK {String(index + 1).padStart(2, "0")}</span><span className="journey-week-title">{guide.nav}</span><span className="journey-indicator">{completed.includes(guide.id) ? <Check size={12} /> : <ArrowRight size={12} />}</span>
              </button>)}
            </div>
          </section>

          {studioOpen ? <StorefrontStudio /> : <>
          {active.id === "prompts" && <AssetLibrary />}

          <section className="reader-section" id="reader-top">
            <div className="reader-topline"><div className="reader-breadcrumb"><span>FIELD GUIDE</span><ChevronRight size={13} /><span>{active.overline}</span></div><button className="print-button" onClick={() => window.print()}><FileText size={14} /> Print / save</button></div>
            <article className="reader-card" id={active.id === "prompts" ? "original-prompt-guide" : undefined}>
              <div className="reader-meta"><span className="chapter-label">{active.overline}</span><span className="reader-source-label">ORIGINAL CURRICULUM · FULL TEXT</span></div>
              <div className="markdown-view" ref={readerRef} key={active.id}>
                <Streamdown>{active.content}</Streamdown>
              </div>
              <div className="reader-endmark"><span /> {active.id === "prompts" ? "END OF THE ORIGINAL PROMPT GUIDE" : "END OF THIS FIELD NOTE"} <span /></div>
            </article>
            <div className="chapter-footer">
              <div className="chapter-completion">
                <button className={`complete-button ${isComplete ? "completed" : ""}`} onClick={toggleComplete} aria-pressed={isComplete}>
                  <span className="complete-check">{isComplete ? <Check size={15} /> : <Circle size={15} />}</span>
                  <span>{isComplete ? "Chapter marked complete" : "Mark this chapter complete"}</span>
                </button>
                <span className="saved-note">Your progress is saved on this device.</span>
              </div>
              <div className="next-step">
                {active.id !== "prompts" && guides[guides.findIndex((guide) => guide.id === active.id) + 1] ? <button onClick={() => selectGuide(guides[guides.findIndex((guide) => guide.id === active.id) + 1].id)}><span>CONTINUE THE JOURNEY</span><ArrowRight size={16} /></button> : <button onClick={() => selectGuide("overview")}><span>BACK TO THE OVERVIEW</span><ArrowRight size={16} /></button>}
              </div>
            </div>
          </section>
          <footer className="main-footer"><span>Made to be worked through, not just read.</span><span>THE STORE DESIGN FIELD GUIDE <b>·</b> SOLENNE STUDIO</span></footer>
          </>}
        </main>

        <aside className="right-rail" aria-label="Your learning progress">
          <div className="progress-card">
            <div className="progress-card-top"><span className="progress-card-label">YOUR FIELD GUIDE</span><span className="progress-spark"><Sparkles size={14} /></span></div>
            <div className="progress-percent">{progress}<span>%</span></div>
            <p className="progress-subtitle">of your learning path complete</p>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="progress-facts"><span><strong>{completed.length}</strong> / {guides.length} chapters</span><span><strong>{checkedTasks}</strong> / {formatCount(totalTasks)} tasks</span></div>
            <div className="card-rule" />
            <div className="active-label">YOU'RE EXPLORING</div>
            <div className="active-chapter"><span className="active-chapter-icon">{studioOpen ? <LayoutTemplate size={16} /> : <active.icon size={16} />}</span><span><strong>{studioOpen ? "Storefront examples" : active.nav}</strong><small>{studioOpen ? "PAGE TEMPLATES IN ACTION" : active.overline}</small></span></div>
            {studioOpen ? <button className="rail-complete-button" onClick={() => selectGuide(active.id)}>Return to the learning guide <ArrowRight size={14} /></button> : <button className={`rail-complete-button ${isComplete ? "is-complete" : ""}`} onClick={toggleComplete}>{isComplete ? <><CheckCircle2 size={15} /> Completed</> : <>Mark chapter done <ArrowRight size={14} /></>}</button>}
          </div>
          <div className="practice-card">
            <div className="practice-heading"><span>YOUR PRACTICE</span><span className="practice-star">✳</span></div>
            <p>Not a course to binge.<br /><em>A craft to practice.</em></p>
            <div className="practice-bottom"><span>READ</span><span>MAKE</span><span>REFLECT</span></div>
          </div>
          <div className="right-quote"><span className="quote-mark">“</span><p>The aim is not just a beautiful storefront. It is knowing <em>why</em> every choice works.</p><span className="quote-byline">THE STUDIO PRINCIPLE</span></div>
          <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to the beginning <ArrowRight size={14} /></button>
        </aside>
      </div>
      <div className="paper-grain" aria-hidden="true" />
    </div>
  );
}

export default App;
