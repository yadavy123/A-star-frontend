import React, { useState, useCallback } from 'react';
import { X, Delete, Equal, Sigma } from 'lucide-react';

interface ScientificCalculatorProps {
    onInsert: (value: string) => void;
    onClose: () => void;
}

const evaluateExpression = (expr: string): number | string => {
    try {
        const sanitized = expr
            .replace(/π/g, `(${Math.PI})`)
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\be\b/g, `(${Math.E})`)
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/asin\(/g, 'Math.asin(')
            .replace(/acos\(/g, 'Math.acos(')
            .replace(/atan\(/g, 'Math.atan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/(\d+)!/g, (_, n: string) => {
                let f = 1;
                for (let i = 2; i <= parseInt(n); i++) f *= i;
                return String(f);
            });

        const result = Function(`"use strict"; return (${sanitized})`)();
        if (typeof result === 'number' && isFinite(result)) {
            return result;
        }
        return 'Error';
    } catch {
        return 'Error';
    }
};

const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ onInsert, onClose }) => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState<number | string | null>(null);
    const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
    const [shiftMode, setShiftMode] = useState(false);
    const [memory, setMemory] = useState<number | null>(null);

    const appendToExpr = useCallback((val: string) => {
        setExpression((prev) => {
            const next = prev + val;
            setDisplay(next || '0');
            return next;
        });
        setResult(null);
    }, []);

    const handleNumber = useCallback((n: string) => {
        appendToExpr(n);
    }, [appendToExpr]);

    const handleOperator = useCallback((op: string) => {
        appendToExpr(` ${op} `);
    }, [appendToExpr]);

    const handleFunction = useCallback((fn: string) => {
        appendToExpr(`${fn}(`);
    }, [appendToExpr]);

    const handleConstant = useCallback((c: string) => {
        appendToExpr(c);
    }, [appendToExpr]);

    const handleEquals = useCallback(() => {
        let exprToEval = expression;
        if (angleMode === 'DEG') {
            exprToEval = exprToEval
                .replace(/sin\(([^)]+)\)/g, (_, a) => `Math.sin((${a})*Math.PI/180)`)
                .replace(/cos\(([^)]+)\)/g, (_, a) => `Math.cos((${a})*Math.PI/180)`)
                .replace(/tan\(([^)]+)\)/g, (_, a) => `Math.tan((${a})*Math.PI/180)`)
                .replace(/asin\(([^)]+)\)/g, (_, a) => `Math.asin(${a})*180/Math.PI`)
                .replace(/acos\(([^)]+)\)/g, (_, a) => `Math.acos(${a})*180/Math.PI`)
                .replace(/atan\(([^)]+)\)/g, (_, a) => `Math.atan(${a})*180/Math.PI`);
        }
        const res = evaluateExpression(exprToEval);
        setResult(res);
        if (typeof res === 'number') {
            setDisplay(String(res));
        } else {
            setDisplay(res);
        }
    }, [expression, angleMode]);

    const handleClear = useCallback(() => {
        setDisplay('0');
        setExpression('');
        setResult(null);
    }, []);

    const handleBackspace = useCallback(() => {
        setExpression((prev) => {
            let trimmed = prev.trimEnd();
            if (trimmed.length >= 2 && trimmed[trimmed.length - 1] === ' ' && trimmed[trimmed.length - 2] !== ' ') {
                trimmed = trimmed.slice(0, -3).trimEnd();
            } else {
                trimmed = trimmed.slice(0, -1);
            }
            setDisplay(trimmed || '0');
            return trimmed;
        });
    }, []);

    const handleInsertResult = useCallback(() => {
        let val: string | null = null;
        if (result !== null && typeof result === 'number') {
            val = String(result);
        } else {
            const parsed = parseFloat(display);
            if (!isNaN(parsed)) val = String(parsed);
        }
        if (val !== null) onInsert(val);
    }, [result, display, onInsert]);

    const handleMemoryRecall = useCallback(() => {
        if (memory !== null) appendToExpr(String(memory));
    }, [memory, appendToExpr]);

    const handleMemoryStore = useCallback(() => {
        if (result !== null && typeof result === 'number') setMemory(result);
        else {
            const v = parseFloat(display);
            if (!isNaN(v)) setMemory(v);
        }
    }, [result, display]);

    const handleMemoryClear = useCallback(() => setMemory(null), []);

    const handleParenthesis = useCallback((p: string) => {
        appendToExpr(p);
    }, [appendToExpr]);

    const b = "px-1.5 py-2.5 sm:px-2 sm:py-3 text-[11px] sm:text-xs md:text-sm font-bold rounded-lg transition-all active:scale-90 select-none min-h-[38px] sm:min-h-[44px] flex items-center justify-center";
    const num = `${b} bg-gray-100 hover:bg-gray-200 text-gray-800`;
    const op = `${b} bg-purple-100 hover:bg-purple-200 text-purple-700`;
    const sci = `${b} bg-indigo-50 hover:bg-indigo-100 text-indigo-700`;
    const fn = `${b} bg-blue-50 hover:bg-blue-100 text-blue-700`;
    const eq = `${b} bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md`;
    const clr = `${b} bg-red-50 hover:bg-red-100 text-red-600`;
    const mem = `${b} bg-gray-50 hover:bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] md:text-xs`;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-1 sm:p-2 md:p-4">
            <div className="w-full max-w-[96vw] sm:max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-700 px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Sigma className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        <span className="text-white font-bold text-[13px] sm:text-sm">Scientific Calculator</span>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                    <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 min-h-[72px] sm:min-h-[90px] flex flex-col justify-end">
                        <div className="text-gray-400 text-[10px] sm:text-xs md:text-sm text-right font-mono break-all min-h-[16px] sm:min-h-[20px] leading-relaxed">
                            {expression || '\u00A0'}
                        </div>
                        <div className={`text-right font-mono font-bold truncate ${result !== null ? 'text-green-400 text-lg sm:text-xl md:text-2xl' : 'text-white text-base sm:text-lg md:text-xl'}`}>
                            {result !== null ? `= ${result}` : display}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <button type="button" onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
                            className={`text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold transition-colors ${angleMode === 'DEG' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {angleMode}
                        </button>
                        <button type="button" onClick={() => setShiftMode(!shiftMode)}
                            className={`text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold transition-colors ${shiftMode ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                            2nd
                        </button>
                        <div className="flex-1 min-w-[4px]" />
                        <button type="button" onClick={handleMemoryClear} className={mem} title="MC">MC</button>
                        <button type="button" onClick={handleMemoryRecall} className={mem} title="MR">MR</button>
                        <button type="button" onClick={handleMemoryStore} className={mem} title="MS">MS</button>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono truncate max-w-[60px] sm:max-w-none">{memory !== null ? `M:${memory}` : 'M:—'}</span>
                    </div>

                    {/* Row 1: Trig, log, ln */}
                    <div className="grid grid-cols-5 gap-0.5 sm:gap-1 md:gap-1.5">
                        {shiftMode ? (
                            <>
                                <button type="button" onClick={() => handleFunction('asin')} className={fn}>sin⁻¹</button>
                                <button type="button" onClick={() => handleFunction('acos')} className={fn}>cos⁻¹</button>
                                <button type="button" onClick={() => handleFunction('atan')} className={fn}>tan⁻¹</button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleFunction('sin')} className={fn}>sin</button>
                                <button type="button" onClick={() => handleFunction('cos')} className={fn}>cos</button>
                                <button type="button" onClick={() => handleFunction('tan')} className={fn}>tan</button>
                            </>
                        )}
                        <button type="button" onClick={() => handleFunction('log')} className={fn}>log</button>
                        <button type="button" onClick={() => handleFunction('ln')} className={fn}>ln</button>
                    </div>

                    {/* Row 2: sqrt, exp, abs, π, e */}
                    <div className="grid grid-cols-5 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => handleFunction('sqrt')} className={sci}>√</button>
                        <button type="button" onClick={() => handleFunction('exp')} className={sci}>eˣ</button>
                        <button type="button" onClick={() => handleFunction('abs')} className={sci}>|x|</button>
                        <button type="button" onClick={() => handleConstant('π')} className={sci}>π</button>
                        <button type="button" onClick={() => handleConstant('e')} className={sci}>e</button>
                    </div>

                    {/* Row 3: AC, (, ), ÷ */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={handleClear} className={clr}>AC</button>
                        <button type="button" onClick={() => handleParenthesis('(')} className={op}>(</button>
                        <button type="button" onClick={() => handleParenthesis(')')} className={op}>)</button>
                        <button type="button" onClick={() => handleOperator('÷')} className={op}>÷</button>
                    </div>

                    {/* Row 4: 7, 8, 9, × */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => handleNumber('7')} className={num}>7</button>
                        <button type="button" onClick={() => handleNumber('8')} className={num}>8</button>
                        <button type="button" onClick={() => handleNumber('9')} className={num}>9</button>
                        <button type="button" onClick={() => handleOperator('×')} className={op}>×</button>
                    </div>

                    {/* Row 5: 4, 5, 6, − */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => handleNumber('4')} className={num}>4</button>
                        <button type="button" onClick={() => handleNumber('5')} className={num}>5</button>
                        <button type="button" onClick={() => handleNumber('6')} className={num}>6</button>
                        <button type="button" onClick={() => handleOperator('−')} className={op}>−</button>
                    </div>

                    {/* Row 6: 1, 2, 3, + */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => handleNumber('1')} className={num}>1</button>
                        <button type="button" onClick={() => handleNumber('2')} className={num}>2</button>
                        <button type="button" onClick={() => handleNumber('3')} className={num}>3</button>
                        <button type="button" onClick={() => handleOperator('+')} className={op}>+</button>
                    </div>

                    {/* Row 7: 0, ., xʸ, ⌫ */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => handleNumber('0')} className={num}>0</button>
                        <button type="button" onClick={() => handleNumber('.')} className={num}>.</button>
                        <button type="button" onClick={() => handleOperator('^')} className={op}>xʸ</button>
                        <button type="button" onClick={handleBackspace} className={clr}>
                            <Delete className="h-3 w-3 sm:h-3.5 md:h-4 md:w-4 mx-auto" />
                        </button>
                    </div>

                    {/* Row 8: x!, x², x½, = */}
                    <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-1.5">
                        <button type="button" onClick={() => appendToExpr('!')} className={sci}>x!</button>
                        <button type="button" onClick={() => appendToExpr('^2')} className={sci}>x²</button>
                        <button type="button" onClick={() => appendToExpr('^(1/2)')} className={sci}>x½</button>
                        <button type="button" onClick={handleEquals} className={eq}>
                            <Equal className="h-3 w-3 sm:h-3.5 md:h-4 md:w-4 mx-auto" />
                        </button>
                    </div>

                    <button type="button" onClick={handleInsertResult}
                        className="w-full py-2.5 sm:py-3 text-[11px] sm:text-xs md:text-sm font-bold rounded-lg sm:rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-md active:scale-95">
                        Insert Result into Editor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;
