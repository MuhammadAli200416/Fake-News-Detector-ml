import { useState } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/predict";

export default function FakeNewsDetector() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const formatted = {
        text,
        prediction: data.label ?? "Unknown",
        confidence: ((data.confidence ?? 0) * 100).toFixed(2),
        analysis: null, // you can fill this later if backend returns it
      };

      setResult(formatted);
      setHistory((prev) => [formatted, ...prev]);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Fake News Detector
            </h1>
            <p className="text-slate-300">
              Analyze news articles and statements for authenticity
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter text to analyze
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your news article or statement here..."
                className="w-full h-40 p-4 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={analyzeText}
              disabled={!text.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Info className="w-5 h-5" />
                  Check Authenticity
                </>
              )}
            </button>

            {result && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                <div
                  className={`p-6 rounded-xl ${
                    result.prediction === "Real"
                      ? "bg-emerald-900/50 border-2 border-emerald-500"
                      : result.prediction === "Fake"
                      ? "bg-red-900/50 border-2 border-red-500"
                      : "bg-yellow-900/30 border-2 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {result.prediction === "Real" ? (
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    ) : result.prediction === "Fake" ? (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    ) : (
                      <Info className="w-8 h-8 text-yellow-300" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Prediction: {result.prediction}
                      </h3>
                      <p className="text-slate-300">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.prediction === "Real"
                          ? "bg-emerald-500"
                          : result.prediction === "Fake"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    <strong>Note:</strong> This analysis is based on machine
                    learning models and should be used as a guide. Always verify
                    information from multiple credible sources.
                  </p>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-8 bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Recent Tests
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-300 border-b border-slate-700">
                        <th className="py-2 pr-4">Text</th>
                        <th className="py-2 pr-4">Label</th>
                        <th className="py-2 pr-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-800">
                          <td className="py-2 pr-4 text-slate-200 max-w-xs truncate">
                            {item.text}
                          </td>
                          <td
                            className={`py-2 pr-4 font-semibold ${
                              item.prediction === "Real"
                                ? "text-emerald-400"
                                : item.prediction === "Fake"
                                ? "text-red-400"
                                : "text-yellow-300"
                            }`}
                          >
                            {item.prediction}
                          </td>
                          <td className="py-2 pr-4 text-slate-200">
                            {item.confidence}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Team Members */}
        <div className="mt-8 bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Development Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-slate-300">
                <p className="font-medium text-white">Muhammad Hassaan</p>
                <p className="text-sm text-slate-400">02-134232-016</p>
              </div>
              <div className="text-slate-300">
                <p className="font-medium text-white">Syed Muhammad Ali</p>
                <p className="text-sm text-slate-400">02-134232-062</p>
              </div>
              <div className="text-slate-300">
                <p className="font-medium text-white">Muhammad Abbas</p>
                <p className="text-sm text-slate-400">02-134232-088</p>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4 mt-4">
              <p className="text-slate-400 text-sm">
                © 2025 Fake News Detection System | AI Lab Project (CSL-411)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
