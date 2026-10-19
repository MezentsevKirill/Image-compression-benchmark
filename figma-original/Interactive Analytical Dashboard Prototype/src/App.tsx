import { useEffect, useRef, useState } from "react"

const assets = "/assets"
const photos = [
  { src: `${assets}/fb907.png`, name: "lighthouse.png" },
  { src: `${assets}/7795c.png`, name: "forest-floor.png" },
  { src: `${assets}/38200.png`, name: "architecture.png" },
]

const algorithms = ["AGU", "BPG", "HEIF", "AVIF", "JPEG"] as const
const metrics = [
  "Encoding Time",
  "Peak RAM",
  "File Size",
  "PSNR",
  "SSIM",
  "MSE",
  "PSNR-HVS",
  "PSNR-HVS-M",
] as const

type Algorithm = typeof algorithms[number]
type Metric = typeof metrics[number]

const metricConfig: Record<Metric, { label: string unit: string max: number }> =
  {
    "Encoding Time": { label: "Encoding Time", unit: "ms", max: 200 },
    "Peak RAM": { label: "Peak RAM", unit: "MB", max: 320 },
    "File Size": { label: "File Size", unit: "KB", max: 900 },
    PSNR: { label: "PSNR", unit: "dB", max: 50 },
    SSIM: { label: "SSIM", unit: "score", max: 1 },
    MSE: { label: "MSE", unit: "px²", max: 120 },
    "PSNR-HVS": { label: "PSNR-HVS", unit: "dB", max: 50 },
    "PSNR-HVS-M": { label: "PSNR-HVS-M", unit: "dB", max: 50 },
  }

const algorithmProfiles: Record<Algorithm, number[]> = {
  AGU: [28, 42, 39, 64, 73, 91, 96, 122, 135, 156, 176],
  BPG: [18, 31, 47, 52, 70, 77, 103, 111, 139, 147, 168],
  HEIF: [22, 36, 44, 69, 66, 88, 108, 119, 128, 159, 166],
  AVIF: [31, 38, 46, 57, 68, 82, 97, 112, 129, 148, 171],
  JPEG: [12, 24, 33, 51, 58, 72, 86, 108, 126, 151, 192],
}
const compressionSteps = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

function getMetricValues(algorithm: Algorithm, metric: Metric) {
  const config = metricConfig[metric]
  const metricIndex = metrics.indexOf(metric)

  return algorithmProfiles[algorithm].map((value, index) => {
    if (metric === "Encoding Time") return value
    const normalized = value / 200
    if (metric === "SSIM")
      return Math.min(0.99, 0.62 + normalized * 0.35 + index * 0.004)
    if (metric === "PSNR" || metric.startsWith("PSNR-HVS"))
      return 21 + normalized * 18 + index * 0.45 + metricIndex * 0.15
    if (metric === "MSE")
      return Math.max(8, 112 - normalized * 82 - index * 2.2)
    return normalized * config.max * (0.74 + metricIndex * 0.025)
  })
}

function getMetricValue(
  algorithm: Algorithm,
  metric: Metric,
  compression: number,
) {
  const values = getMetricValues(algorithm, metric)
  const upperIndex = compressionSteps.findIndex((step) => step >= compression)

  if (upperIndex <= 0) return values[0]
  const lowerIndex = upperIndex - 1
  const lowerStep = compressionSteps[lowerIndex]
  const upperStep = compressionSteps[upperIndex]
  const progress = (compression - lowerStep) / (upperStep - lowerStep)

  return (
    values[lowerIndex] + (values[upperIndex] - values[lowerIndex]) * progress
  )
}

function SectionTitle({
  number,
  children,
}: {
  number: string
  children: string
}) {
  return (
    <div className="section-title">
      <span>{number}</span>
      <h2>{children}</h2>
    </div>
  )
}

function ParameterRange({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  format: (value: number) => string
}) {
  const progress = ((value - min) / (max - min)) * 100
  return (
    <div className="parameter">
      <label>{label}</label>
      <div className="range-row">
        <input
          aria-label={label}
          className="range-input"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
          type="range"
          value={value}
        />
        <input
          aria-label={`${label} value`}
          className="number-input"
          max={max}
          min={min}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (!Number.isNaN(next))
              onChange(Math.min(max, Math.max(min, next)))
          }}
          step={step}
          type="number"
          value={format(value)}
        />
      </div>
      <div className="range-limits">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function Chart({
  algorithm,
  metric,
  compression,
}: {
  algorithm: Algorithm
  metric: Metric
  compression: number
}) {
  const config = metricConfig[metric]
  const values = getMetricValues(algorithm, metric)
  const points = values
    .map((value, index) => {
      const x = 48 + ((compressionSteps[index] - 1) / 99) * 852
      const y = 26 + (1 - value / config.max) * 150
      return `${x},${y}`
    })
    .join(" ")
  const selectedValue = getMetricValue(algorithm, metric, compression)
  const selectedX = 48 + ((compression - 1) / 99) * 852
  const selectedY = 26 + (1 - selectedValue / config.max) * 150
  const selectedLabel =
    config.max <= 1 ? selectedValue.toFixed(3) : selectedValue.toFixed(1)
  const ticks = [
    config.max,
    config.max * 0.75,
    config.max * 0.5,
    config.max * 0.25,
    0,
  ]

  return (
    <div className="chart-wrap">
      <svg
        aria-label={`${metric} chart for ${algorithm}`}
        className="chart"
        viewBox="0 0 940 225"
      >
        <g className="chart-grid">
          {ticks.map((_, index) => (
            <line
              key={index}
              x1="48"
              x2="900"
              y1={26 + index * 37.5}
              y2={26 + index * 37.5}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <line
              key={index}
              x1={48 + index * 170.4}
              x2={48 + index * 170.4}
              y1="26"
              y2="176"
            />
          ))}
        </g>
        <g className="chart-labels">
          {ticks.map((value, index) => (
            <text key={index} textAnchor="end" x="38" y={30 + index * 37.5}>
              {config.max <= 1 ? value.toFixed(2) : Math.round(value)}
            </text>
          ))}
          {[1, 20, 40, 60, 80, 100].map((value, index) => (
            <text
              key={value}
              textAnchor="middle"
              x={48 + index * 170.4}
              y="196"
            >
              {value}
            </text>
          ))}
        </g>
        <text
          className="axis-title y-axis"
          textAnchor="middle"
          transform="rotate(-90 12 102)"
          x="12"
          y="102"
        >
          {config.label} ({config.unit})
        </text>
        <text className="axis-title" textAnchor="middle" x="474" y="218">
          Compression Parameter
        </text>
        <polyline className="metric-line line-draw" points={points} />
        <g className="selected-point">
          <line x1={selectedX} x2={selectedX} y1="26" y2="176" />
          <circle cx={selectedX} cy={selectedY} r="10" />
          <circle
            className="selected-point-core"
            cx={selectedX}
            cy={selectedY}
            r="4"
          />
          <g
            transform={`translate(${Math.min(810, Math.max(58, selectedX - 44))} ${Math.max(10, selectedY - 38)})`}
          >
            <rect height="25" rx="4" width="88" />
            <text textAnchor="middle" x="44" y="17">
              QS {compression} · {selectedLabel}
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}

function App() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("AGU")
  const [algorithmOpen, setAlgorithmOpen] = useState(false)
  const [metric, setMetric] = useState<Metric>("Encoding Time")
  const [noise, setNoise] = useState(0.01)
  const [compression, setCompression] = useState(25)
  const [color, setColor] = useState(true)
  const [divider, setDivider] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const comparisonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dragging) return
    const move = (event: PointerEvent) => {
      const rect = comparisonRef.current?.getBoundingClientRect()
      if (!rect) return
      setDivider(
        Math.min(
          96,
          Math.max(4, ((event.clientX - rect.left) / rect.width) * 100),
        ),
      )
    }
    const stop = () => setDragging(false)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
  }, [dragging])

  const runBenchmark = () => {
    if (processing) return
    setProcessing(true)
    window.setTimeout(() => {
      setRefresh((value) => value + 1)
      setDivider(50)
      setProcessing(false)
    }, 2000)
  }
  const fileSize = getMetricValue(algorithm, "File Size", compression)
  const resultCards = [
    { label: "File Size", value: `${fileSize.toFixed(1)} KB` },
    { label: "Compression Ratio", value: `${(768 / fileSize).toFixed(2)}×` },
    {
      label: "Encoding Time",
      value: `${getMetricValue(algorithm, "Encoding Time", compression).toFixed(1)} ms`,
    },
    {
      label: "Peak RAM",
      value: `${getMetricValue(algorithm, "Peak RAM", compression).toFixed(1)} MB`,
    },
  ]

  return (
    <main className="workspace">
      <aside className="controls">
        <div className="control-sections">
          <section>
            <SectionTitle number="01">Data Source</SectionTitle>
            <div className="carousel">
              <img alt="" className="small-icon" src={`${assets}/ae09d.svg`} />
              {photos.map((photo, index) => (
                <button
                  className={`thumbnail ${index === 0 ? "selected" : ""}`}
                  key={photo.name}
                  type="button"
                >
                  <img alt={photo.name} src={photo.src} />
                </button>
              ))}
              <img alt="" className="small-icon" src={`${assets}/2da2b.svg`} />
            </div>
            <div className="file-meta">
              <strong>lighthouse.png</strong>
              <span>
                PNG
                <br />
                <b>512x512 px</b>
              </span>
            </div>
            <button className="upload-button" type="button">
              <img alt="" src={`${assets}/afbb7.svg`} /> Upload custom image
            </button>
            <label className="field-label">Color Mode</label>
            <div className="toggle-row">
              <span className={!color ? "active-label" : ""}>Grayscale</span>
              <button
                aria-checked={color}
                aria-label="Toggle color mode"
                className={`switch ${color ? "on" : ""}`}
                onClick={() => setColor((value) => !value)}
                role="switch"
                type="button"
              >
                <span />
              </button>
              <span className={color ? "active-label" : ""}>BGR Channels</span>
            </div>
          </section>

          <section>
            <SectionTitle number="02">Noise Parameters</SectionTitle>
            <label className="field-label" htmlFor="noise-type">
              Noise Type
            </label>
            <div className="select-shell">
              <select defaultValue="AWGN" id="noise-type">
                <option>None</option>
                <option>AWGN</option>
                <option>Poisson</option>
              </select>
              <img alt="" src={`${assets}/1943b.svg`} />
            </div>
            <p className="hint">Available: None · AWGN · Poisson</p>
            <ParameterRange
              format={(value) => value.toFixed(4)}
              label="Noise Variance"
              max={0.1}
              min={0.0001}
              onChange={setNoise}
              step={0.0001}
              value={noise}
            />
          </section>

          <section>
            <SectionTitle number="03">Encoders Configuration</SectionTitle>
            <label className="field-label">Select Algorithm</label>
            <div className="dropdown">
              <button
                aria-expanded={algorithmOpen}
                className="dropdown-trigger"
                onClick={() => setAlgorithmOpen((value) => !value)}
                type="button"
              >
                <span className="selected-algorithm-label">
                  <i />
                  {algorithm}
                </span>
                <img alt="" src={`${assets}/421fb.svg`} />
              </button>
              {algorithmOpen && (
                <div className="dropdown-menu">
                  {algorithms.map((option) => (
                    <button
                      className={algorithm === option ? "chosen" : ""}
                      key={option}
                      onClick={() => {
                        setAlgorithm(option)
                        setAlgorithmOpen(false)
                      }}
                      type="button"
                    >
                      <i />
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="hint">Available: AGU · BPG · HEIF · AVIF · JPEG</p>
            <ParameterRange
              format={(value) => value.toFixed(0)}
              label="Compression Step (QS)"
              max={100}
              min={1}
              onChange={setCompression}
              step={1}
              value={compression}
            />
          </section>
        </div>

        <div className="run-area">
          <button
            className="run-button"
            disabled={processing}
            onClick={runBenchmark}
            type="button"
          >
            {processing ? (
              <span className="spinner" />
            ) : (
              <img alt="" src={`${assets}/b2e50.svg`} />
            )}
            {processing ? "Processing..." : "Run Benchmark"}
          </button>
          <p>Preview configuration · controls are illustrative</p>
        </div>
      </aside>

      <div className="analysis">
        <section className="panel comparison-panel">
          <header className="panel-header">
            <h1>Visual Comparison</h1>
            <div className="algorithm-badge">
              {algorithm} · QS {compression}
              <img alt="" src={`${assets}/57d32.svg`} />
            </div>
          </header>
          <div className="comparison-content">
            <div
              aria-label="Before and after image comparison"
              className={`comparison ${
                color ? "" : "grayscale"
              } refresh-${refresh % 2}`}
              ref={comparisonRef}
            >
              <img
                alt="Decoded lighthouse"
                className="comparison-image decoded"
                key={`decoded-${refresh}`}
                src={photos[0].src}
              />
              <div className="decoded-treatment" />
              <div
                className="before-layer"
                style={{ clipPath: `inset(0 ${100 - divider}% 0 0)` }}
              >
                <img
                  alt="Noised original lighthouse"
                  className="comparison-image original"
                  key={`original-${refresh}`}
                  src={photos[0].src}
                />
                <div
                  className="noise-treatment"
                  style={{ opacity: Math.min(0.4, 0.08 + noise * 2.4) }}
                />
              </div>
              <span className="image-tag before-tag">
                BEFORE · NOISED ORIGINAL
              </span>
              <span className="image-tag after-tag">
                AFTER · DECODED {algorithm}
              </span>
              <div className="divider" style={{ left: `${divider}%` }}>
                <button
                  aria-label="Drag comparison divider"
                  className="divider-handle"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  type="button"
                >
                  <img alt="" src={`${assets}/fc133.svg`} />
                </button>
              </div>
              <span className="image-note">
                ILLUSTRATIVE NOISE &amp; COMPRESSION ARTIFACTS
              </span>
            </div>
            <aside className="results" aria-label="Compression results">
              <div className="results-heading">
                <span>Current Results</span>
                <b>QS {compression}</b>
              </div>
              <div className="result-grid">
                {resultCards.map((result) => (
                  <div className="result-card" key={result.label}>
                    <span>{result.label}</span>
                    <strong>
                      {result.label === "Compression Ratio"
                        ? compression
                        : result.value}
                    </strong>
                  </div>
                ))}
              </div>
            </aside>
          </div>
          <div className="comparison-meta">
            <span>
              lighthouse.png · 512×512 px · {color ? "RGB" : "Grayscale"} · AWGN
              σ² = {noise.toFixed(4)} · {algorithm}
            </span>
            <span>
              <img alt="" src={`${assets}/4d921.svg`} /> Comparison position{" "}
              {Math.round(divider)}%
            </span>
          </div>
        </section>

        <section className="panel metrics-panel">
          <header className="panel-header metrics-heading">
            <h1>Performance Metrics</h1>
            <span>PREVIEW / SAMPLE DATA ONLY</span>
          </header>
          <Chart
            algorithm={algorithm}
            compression={compression}
            metric={metric}
          />
          <div className="chart-caption">
            <span className="legend">
              <i />
              {algorithm}
            </span>
            <span>Illustrative trends · not benchmark results</span>
          </div>
          <div className="metric-tabs" role="tablist">
            {metrics.map((item) => (
              <button
                aria-selected={metric === item}
                className={metric === item ? "active" : ""}
                key={item}
                onClick={() => setMetric(item)}
                role="tab"
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
