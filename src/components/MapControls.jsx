function MapControls() {
    return (
        <div className="flex pointer-events-auto space-y-4">
            <section className="max-w-xs m-4 rounded-2xl bg-slate-950/75 p-4 shadow-lg">

                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Map Controls
                </h2>

                <div className="space-y-2 text-xs text-slate-300">
                    <button className="w-full rounded-lg bg-slate-800 px-3 py-2 text-left hover:bg-slate-700">
                        Zoom / Layer controls
                    </button>
                </div>
            </section>
        </div>
    );
}

export default MapControls;
