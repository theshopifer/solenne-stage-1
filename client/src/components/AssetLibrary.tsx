import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Download, Image as ImageIcon, Search, X } from "lucide-react";
import assets from "../content/asset-library.json";

type Asset = (typeof assets)[number];

export default function AssetLibrary() {
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("All assets");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const sections = useMemo(() => Array.from(new Set(assets.map((asset) => asset.sectionTitle))), []);
  const filtered = assets.filter((asset) => {
    const matchesSection = selectedSection === "All assets" || asset.sectionTitle === selectedSection;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || `${asset.title} ${asset.filename} ${asset.category} ${asset.sectionTitle} ${asset.alt}`.toLowerCase().includes(term);
    return matchesSection && matchesQuery;
  });
  const groups = Array.from(new Set(filtered.map((asset) => asset.sectionTitle)));

  useEffect(() => {
    if (!selectedAsset) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedAsset(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedAsset]);

  return (
    <section className="asset-library" id="visual-asset-library" aria-label="SOLENNE visual asset library">
      <div className="asset-library-head">
        <div className="asset-library-kicker"><span /> THE VISUAL KIT · {assets.length} ORIGINAL ASSETS</div>
        <h2>Made to be <em>put to work.</em></h2>
        <p>Browse the full SOLENNE image and SVG library—organized for the storefront, ready to preview, and one click from the original file.</p>
        <div className="asset-library-toolbar">
          <label className="asset-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product, visual, or file…" aria-label="Search visual assets" /><span>{filtered.length} / {assets.length}</span></label>
          <a className="asset-guide-jump" href="#original-prompt-guide">Read the image prompt guide <ArrowUpRight size={13} /></a>
        </div>
      </div>

      <div className="asset-filter-row" aria-label="Filter assets by section">
        {["All assets", ...sections].map((section) => (
          <button key={section} className={`asset-filter-chip ${selectedSection === section ? "selected" : ""}`} onClick={() => setSelectedSection(section)} aria-pressed={selectedSection === section}>
            {section === "All assets" ? section : section.replace(/^\d+\s·\s/, "")}
            <span>{section === "All assets" ? assets.length : assets.filter((asset) => asset.sectionTitle === section).length}</span>
          </button>
        ))}
      </div>

      {filtered.length ? groups.map((section) => (
        <div className="asset-group" key={section}>
          <div className="asset-group-heading"><h3>{section.replace(/^\d+\s·\s/, "")}</h3><span>{filtered.filter((asset) => asset.sectionTitle === section).length} FILES</span></div>
          <div className="asset-grid">
            {filtered.filter((asset) => asset.sectionTitle === section).map((asset) => (
              <article className="asset-card" key={asset.filename}>
                <button className={`asset-preview ${asset.type === "SVG" ? "is-svg" : ""}`} onClick={() => setSelectedAsset(asset)} aria-label={`Preview ${asset.title}`}>
                  <img src={asset.storageUrl} alt={asset.alt} loading="lazy" />
                  <span className="asset-open-cue"><ArrowUpRight size={14} /></span>
                  <span className="asset-filetype">{asset.type === "SVG" ? "VECTOR" : asset.filename.split(".").pop()?.toUpperCase()}</span>
                </button>
                <div className="asset-card-copy"><div><h4>{asset.title}</h4><p>{asset.dimensions}</p></div><a href={asset.storageUrl} target="_blank" rel="noreferrer" title={`Open original file: ${asset.filename}`} aria-label={`Open original file: ${asset.filename}`}><ArrowUpRight size={14} /></a></div>
              </article>
            ))}
          </div>
        </div>
      )) : <div className="asset-empty"><ImageIcon size={22} /><strong>No assets match that search.</strong><span>Try a product name, collection, or SVG icon.</span></div>}

      <div className="asset-archive-note"><span>ARCHIVE NOTE</span><p>The five GPT image-generation reference scenes are retained in the source archive but intentionally omitted from the production asset gallery, as noted in its handoff README.</p></div>

      {selectedAsset && <div className="asset-modal-backdrop" role="presentation" onClick={() => setSelectedAsset(null)}>
        <div className="asset-modal" role="dialog" aria-modal="true" aria-labelledby="asset-modal-title" onClick={(event) => event.stopPropagation()}>
          <div className="asset-modal-head"><div><span>{selectedAsset.sectionTitle.replace(/^\d+\s·\s/, "")}</span><h3 id="asset-modal-title">{selectedAsset.title}</h3></div><button className="asset-modal-close" onClick={() => setSelectedAsset(null)} aria-label="Close preview"><X size={18} /></button></div>
          <div className="asset-modal-image"><img src={selectedAsset.storageUrl} alt={selectedAsset.alt} /></div>
          <div className="asset-modal-foot"><div><strong>{selectedAsset.filename}</strong><span>{selectedAsset.type} · {selectedAsset.dimensions}</span></div><a href={selectedAsset.storageUrl} download={selectedAsset.filename} target="_blank" rel="noreferrer"><Download size={14} /> Open original</a></div>
        </div>
      </div>}
    </section>
  );
}
