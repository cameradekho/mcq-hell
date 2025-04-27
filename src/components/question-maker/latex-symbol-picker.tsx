import React, { useState } from "react";
import { XCircle } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { cn } from "../../lib/utils";

// LaTeX symbol categories and symbols
const latexSymbols = [
  {
    category: "Greek Letters",
    symbols: [
      { symbol: "\\alpha", display: "α" },
      { symbol: "\\beta", display: "β" },
      { symbol: "\\gamma", display: "γ" },
      { symbol: "\\delta", display: "δ" },
      { symbol: "\\epsilon", display: "ε" },
      { symbol: "\\zeta", display: "ζ" },
      { symbol: "\\eta", display: "η" },
      { symbol: "\\theta", display: "θ" },
      { symbol: "\\iota", display: "ι" },
      { symbol: "\\kappa", display: "κ" },
      { symbol: "\\lambda", display: "λ" },
      { symbol: "\\mu", display: "μ" },
      { symbol: "\\nu", display: "ν" },
      { symbol: "\\xi", display: "ξ" },
      { symbol: "\\pi", display: "π" },
      { symbol: "\\rho", display: "ρ" },
      { symbol: "\\sigma", display: "σ" },
      { symbol: "\\tau", display: "τ" },
      { symbol: "\\upsilon", display: "υ" },
      { symbol: "\\phi", display: "φ" },
      { symbol: "\\chi", display: "χ" },
      { symbol: "\\psi", display: "ψ" },
      { symbol: "\\omega", display: "ω" },
    ],
  },
  {
    category: "Operators",
    symbols: [
      { symbol: "+", display: "+" },
      { symbol: "-", display: "-" },
      { symbol: "\\times", display: "×" },
      { symbol: "\\div", display: "÷" },
      { symbol: "\\pm", display: "±" },
      { symbol: "\\cdot", display: "·" },
      { symbol: "\\cup", display: "∪" },
      { symbol: "\\cap", display: "∩" },
      { symbol: "\\setminus", display: "∖" },
      { symbol: "\\subset", display: "⊂" },
      { symbol: "\\subseteq", display: "⊆" },
      { symbol: "\\in", display: "∈" },
      { symbol: "\\notin", display: "∉" },
      { symbol: "\\emptyset", display: "∅" },
      { symbol: "\\equiv", display: "≡" },
    ],
  },
  {
    category: "Calculus",
    symbols: [
      { symbol: "\\int", display: "∫" },
      { symbol: "\\oint", display: "∮" },
      { symbol: "\\partial", display: "∂" },
      { symbol: "\\nabla", display: "∇" },
      { symbol: "\\sum", display: "∑" },
      { symbol: "\\prod", display: "∏" },
      { symbol: "\\lim", display: "lim" },
      { symbol: "\\infty", display: "∞" },
      { symbol: "\\frac{a}{b}", display: "a/b" },
      { symbol: "\\sqrt{x}", display: "√x" },
      { symbol: "\\sqrt[n]{x}", display: "ⁿ√x" },
    ],
  },
  {
    category: "Relations",
    symbols: [
      { symbol: "=", display: "=" },
      { symbol: "\\neq", display: "≠" },
      { symbol: "<", display: "<" },
      { symbol: ">", display: ">" },
      { symbol: "\\leq", display: "≤" },
      { symbol: "\\geq", display: "≥" },
      { symbol: "\\approx", display: "≈" },
      { symbol: "\\sim", display: "∼" },
      { symbol: "\\cong", display: "≅" },
      { symbol: "\\propto", display: "∝" },
    ],
  },
  {
    category: "Arrows",
    symbols: [
      { symbol: "\\rightarrow", display: "→" },
      { symbol: "\\leftarrow", display: "←" },
      { symbol: "\\Rightarrow", display: "⇒" },
      { symbol: "\\Leftarrow", display: "⇐" },
      { symbol: "\\mapsto", display: "↦" },
      { symbol: "\\leftrightarrow", display: "↔" },
      { symbol: "\\Leftrightarrow", display: "⇔" },
    ],
  },
  {
    category: "Templates",
    symbols: [
      { symbol: "x^2", display: "x²" },
      { symbol: "x_i", display: "xᵢ" },
      { symbol: "\\frac{dy}{dx}", display: "dy/dx" },
      {
        symbol: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}",
        display: "matrix",
      },
      {
        symbol: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
        display: "(matrix)",
      },
      {
        symbol: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
        display: "[matrix]",
      },
    ],
  },
  {
    category: "Fractions",
    symbols: [
      { symbol: "\\frac{1}{2}", display: "½" },
      { symbol: "\\frac{1}{3}", display: "⅓" },
      { symbol: "\\frac{2}{3}", display: "⅔" },
      { symbol: "\\frac{1}{4}", display: "¼" },
      { symbol: "\\frac{3}{4}", display: "¾" },
      { symbol: "\\frac{1}{x}", display: "1/x" },
      { symbol: "\\frac{x}{y}", display: "x/y" },
      { symbol: "\\frac{a+b}{c-d}", display: "(a+b)/(c-d)" },
    ],
  },
];

// Custom fraction builder component
const FractionBuilder = ({
  onInsert,
}: {
  onInsert: (fraction: string) => void;
}) => {
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");

  const handleInsert = () => {
    const num = numerator.trim() || "a";
    const den = denominator.trim() || "b";
    onInsert(`\\frac{${num}}{${den}}`);
  };

  return (
    <div className="p-3 border rounded-md bg-muted/10">
      <div className="text-sm font-medium mb-2">Custom Fraction</div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={numerator}
          onChange={(e) => setNumerator(e.target.value)}
          className="w-full p-2 border rounded-md text-sm"
          placeholder="Numerator (top)"
        />
        <div className="w-full border-t border-foreground/50 my-1"></div>
        <input
          type="text"
          value={denominator}
          onChange={(e) => setDenominator(e.target.value)}
          className="w-full p-2 border rounded-md text-sm"
          placeholder="Denominator (bottom)"
        />
        <button
          onClick={handleInsert}
          className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
        >
          Insert Fraction
        </button>
      </div>
      <div className="mt-3 text-center">
        <div className="text-xs text-muted-foreground mb-1">Preview:</div>
        <div className="text-lg">
          {tryRenderLatex(
            `$\\frac{${numerator || "a"}}{${denominator || "b"}}$`
          )}
        </div>
      </div>
    </div>
  );
};

interface LatexSymbolPickerProps {
  onSelectSymbol: (symbol: string) => void;
  onClose: () => void;
}

const LatexSymbolPicker = ({
  onSelectSymbol,
  onClose,
}: LatexSymbolPickerProps) => {
  const [activeCategory, setActiveCategory] = useState(
    latexSymbols[0].category
  );
  const [previewSymbol, setPreviewSymbol] = useState<string>("");
  const [equation, setEquation] = useState<string>("");
  const [displayMode, setDisplayMode] = useState<"inline" | "block">("inline");
  const [showFractionBuilder, setShowFractionBuilder] = useState(false);

  const handleInsertSymbol = (symbol: string) => {
    // Insert at cursor position or append to the end
    const textArea = document.getElementById(
      "equation-editor"
    ) as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart || 0;
      const end = textArea.selectionEnd || 0;
      const newEquation =
        equation.substring(0, start) + symbol + equation.substring(end);
      setEquation(newEquation);

      // Focus back on textarea after insertion
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(
          start + symbol.length,
          start + symbol.length
        );
      }, 10);
    } else {
      setEquation(equation + symbol);
    }
  };

  const handleInsertFinalEquation = () => {
    // Wrap equation in appropriate delimiters based on display mode
    let finalEquation = equation;
    if (displayMode === "inline" && !finalEquation.startsWith("$")) {
      finalEquation = `$${finalEquation}$`;
    } else if (displayMode === "block" && !finalEquation.startsWith("$$")) {
      finalEquation = `$$${finalEquation}$$`;
    }
    onSelectSymbol(finalEquation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[700px] rounded-lg bg-background shadow-lg border border-input max-h-[90vh] flex flex-col">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-medium">LaTeX Equation Editor</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Symbol Categories */}
          <div className="w-full md:w-1/3 md:border-r">
            <div className="p-3 border-b">
              <div className="overflow-x-auto flex space-x-1">
                {latexSymbols.map((category) => (
                  <button
                    key={category.category}
                    className={cn(
                      "px-2 py-1 text-xs whitespace-nowrap rounded-md",
                      activeCategory === category.category
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setActiveCategory(category.category);
                      setShowFractionBuilder(category.category === "Fractions");
                    }}
                  >
                    {category.category}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto p-3 max-h-[30vh] md:max-h-[50vh]">
              {showFractionBuilder ? (
                <FractionBuilder onInsert={handleInsertSymbol} />
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {latexSymbols
                    .find((category) => category.category === activeCategory)
                    ?.symbols.map((symbolObj) => (
                      <button
                        key={symbolObj.symbol}
                        className="p-2 text-center border rounded hover:bg-muted flex items-center justify-center h-10"
                        onClick={() => handleInsertSymbol(symbolObj.symbol)}
                        onMouseEnter={() => setPreviewSymbol(symbolObj.symbol)}
                        title={symbolObj.symbol}
                      >
                        {symbolObj.display}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Equation Editor */}
          <div className="w-full md:w-2/3 flex flex-col p-3 overflow-hidden">
            {/* Equation Preview */}
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">
                Equation Preview:
              </div>
              <div className="bg-muted/20 p-4 rounded-md flex items-center justify-center min-h-[100px]">
                <div className="latex-preview text-lg overflow-x-auto w-full text-center">
                  {equation ? (
                    tryRenderLatex(
                      displayMode === "inline"
                        ? `$${equation}$`
                        : `$$${equation}$$`
                    )
                  ) : (
                    <span className="text-muted-foreground italic">
                      Preview will appear here
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Display Mode Toggle */}
            <div className="flex items-center mb-3 space-x-4">
              <div className="text-sm">Display Mode:</div>
              <div className="flex items-center space-x-2">
                <button
                  className={cn(
                    "px-3 py-1 text-xs rounded-md border",
                    displayMode === "inline"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setDisplayMode("inline")}
                >
                  Inline ($...$)
                </button>
                <button
                  className={cn(
                    "px-3 py-1 text-xs rounded-md border",
                    displayMode === "block"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setDisplayMode("block")}
                >
                  Block ($$...$$)
                </button>
              </div>
            </div>

            {/* Equation Text Editor */}
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                Edit Equation:
              </div>
              <textarea
                id="equation-editor"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                className="w-full h-[150px] p-3 border rounded-md font-mono text-sm resize-none"
                placeholder="Enter or edit your LaTeX equation here"
              />
            </div>
          </div>
        </div>

        {/* Symbol Preview (small) */}
        {previewSymbol && !showFractionBuilder && (
          <div className="p-3 border-t bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Symbol Preview:{" "}
              <code className="bg-muted/30 px-1 rounded">{previewSymbol}</code>
            </div>
            <div className="text-sm mt-1">
              {tryRenderLatex(`$${previewSymbol}$`)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-3 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border rounded-md hover:bg-muted text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleInsertFinalEquation}
            disabled={!equation.trim()}
            className={cn(
              "px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm",
              !equation.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            Insert Equation
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to safely attempt to render LaTeX
export function tryRenderLatex(text: any) {
  try {
    // Process text to handle both inline and block LaTeX
    const parts = [];
    let lastIndex = 0;
    let inBlockMath = false;
    let inInlineMath = false;

    // Regular expressions for detecting LaTeX delimiters
    const blockRegex = /\$\$(.*?)\$\$/g;
    const inlineRegex = /\$(.*?)\$/g;

    // First handle block math ($$...$$)
    let blockMatch;
    while ((blockMatch = blockRegex.exec(text)) !== null) {
      // Add text before the match
      if (blockMatch.index > lastIndex) {
        parts.push(text.substring(lastIndex, blockMatch.index));
      }

      // Add the BlockMath component for the LaTeX content
      parts.push(<BlockMath math={blockMatch[1]} />);

      lastIndex = blockMatch.index + blockMatch[0].length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);

      // Now process inline math ($...$) in the remaining text
      let remainingParts = [];
      let lastInlineIndex = 0;
      let inlineMatch;

      while ((inlineMatch = inlineRegex.exec(remaining)) !== null) {
        // Add text before the match
        if (inlineMatch.index > lastInlineIndex) {
          remainingParts.push(
            remaining.substring(lastInlineIndex, inlineMatch.index)
          );
        }

        // Add the InlineMath component for the LaTeX content
        remainingParts.push(<InlineMath math={inlineMatch[1]} />);

        lastInlineIndex = inlineMatch.index + inlineMatch[0].length;
      }

      // Add any final remaining text
      if (lastInlineIndex < remaining.length) {
        remainingParts.push(remaining.substring(lastInlineIndex));
      }

      parts.push(...remainingParts);
    }

    return parts.length > 0 ? parts : text;
  } catch (error) {
    // If LaTeX rendering fails, return the original text
    console.error("LaTeX rendering error:", error);
    return text;
  }
}

export default LatexSymbolPicker;
