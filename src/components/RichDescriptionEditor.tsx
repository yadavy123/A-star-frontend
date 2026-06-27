import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X, Maximize2, Minimize2, Eye, Edit2, Plus, List, ListOrdered, Quote, Code, Highlighter, Calculator, Sigma, Trash2 } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ScientificCalculator from './ScientificCalculator';
// @ts-expect-error: react-mathquill has no types
import { EditableMathField, addStyles } from 'react-mathquill';

addStyles();

interface RichDescriptionEditorProps {
    value: string;
    onChange: (content: string) => void;
}

interface MathFormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (latex: string, isBlock: boolean) => void;
}

const MathFormulaModal: React.FC<MathFormulaModalProps> = ({ isOpen, onClose, onInsert }) => {
    const [latex, setLatex] = useState('');
    const [isBlock, setIsBlock] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'greek' | 'symbols'>('basic');

    const basicMath = [
        { label: 'Fraction', latex: '\\frac{a}{b}' },
        { label: 'Power', latex: 'x^{n}' },
        { label: 'Subscript', latex: 'x_{n}' },
        { label: 'Square Root', latex: '\\sqrt{x}' },
        { label: 'n-th Root', latex: '\\sqrt[n]{x}' },
        { label: 'Sum', latex: '\\sum_{i=1}^{n}' },
        { label: 'Integral', latex: '\\int_{a}^{b}' },
        { label: 'Limit', latex: '\\lim_{x \\to \\infty}' },
    ];

    const greek = [
        { label: 'Alpha', latex: '\\alpha' },
        { label: 'Beta', latex: '\\beta' },
        { label: 'Gamma', latex: '\\gamma' },
        { label: 'Delta', latex: '\\Delta' },
        { label: 'Theta', latex: '\\theta' },
        { label: 'Lambda', latex: '\\lambda' },
        { label: 'Pi', latex: '\\pi' },
        { label: 'Sigma', latex: '\\sigma' },
        { label: 'Omega', latex: '\\omega' },
        { label: 'Phi', latex: '\\phi' },
    ];

    const symbols = [
        { label: '±', latex: '\\pm' },
        { label: '×', latex: '\\times' },
        { label: '÷', latex: '\\div' },
        { label: '≈', latex: '\\approx' },
        { label: '≠', latex: '\\neq' },
        { label: '≤', latex: '\\leq' },
        { label: '≥', latex: '\\geq' },
        { label: '∞', latex: '\\infty' },
        { label: '→', latex: '\\rightarrow' },
        { label: '⇒', latex: '\\Rightarrow' },
    ];

    const activeItems = activeTab === 'basic' ? basicMath : activeTab === 'greek' ? greek : symbols;

    if (!isOpen) {
        return null;
    }

    return (
        <div className={'fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4'}>
            <div className={'w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col'}>
                <div className={'flex items-center justify-between bg-purple-700 p-4 text-white'}>
                    <div className={'flex items-center gap-2'}>
                        <Sigma className={'h-5 w-5'} />
                        <span className={'font-bold'}>Formula Editor</span>
                    </div>
                    <button onClick={onClose} className={'p-1 hover:bg-white/20 rounded-full transition-colors'}>
                        <X className={'h-5 w-5'} />
                    </button>
                </div>

                <div className={'p-6 space-y-6'}>
                    <div className={'space-y-2'}>
                        <label className={'text-xs font-bold text-gray-500 uppercase tracking-wider'}>Visual Math Input</label>
                        <div className={'border-2 border-purple-100 rounded-2xl p-4 bg-purple-50 focus-within:border-purple-400 transition-all'}>
                            <EditableMathField
                                latex={latex}
                                onChange={(mathField: any) => setLatex(mathField.latex())}
                                className={'w-full min-h-[60px] text-xl'}
                            />
                        </div>
                    </div>

                    <div className={'space-y-3'}>
                        <div className={'flex gap-2 p-1 bg-gray-100 rounded-xl'}>
                            {(['basic', 'greek', 'symbols'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className={'grid grid-cols-4 gap-2'}>
                            {activeItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setLatex((prev) => prev + item.latex)}
                                    className={'p-2 text-[10px] bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded-lg transition-all font-medium'}
                                    title={item.label}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(item.latex, { throwOnError: false }) }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={'flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200'}>
                        <div className={'flex items-center gap-3'}>
                            <span className={'text-sm font-bold text-gray-700'}>Display Style:</span>
                            <div className={'flex bg-white rounded-lg border border-gray-200 p-0.5'}>
                                <button
                                    onClick={() => setIsBlock(false)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isBlock ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
                                >
                                    Inline
                                </button>
                                <button
                                    onClick={() => setIsBlock(true)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isBlock ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
                                >
                                    Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={'p-4 bg-gray-50 border-t flex gap-3'}>
                    <button onClick={onClose} className={'flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all'}>
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            const trimmed = latex.trim();
                            if (!trimmed) {
                                return;
                            }
                            onInsert(trimmed, isBlock);
                            setLatex('');
                            onClose();
                        }}
                        className={'flex-1 py-3 text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2'}
                    >
                        <Plus className={'h-4 w-4'} />
                        Insert Formula
                    </button>
                </div>
            </div>
        </div>
    );
};

const RichDescriptionEditor: React.FC<RichDescriptionEditorProps> = ({ value, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [modalContent, setModalContent] = useState(value);
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [isMathModalOpen, setIsMathModalOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
        ],
        content: value || '',
        immediatelyRender: false,
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.getHTML();
            if (html !== value) {
                onChange(html);
            }
        },
    });

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        setModalContent(editor?.getHTML() || value || '');
        const timer = window.setTimeout(() => {
            editor?.commands.focus();
        }, 150);

        return () => window.clearTimeout(timer);
    }, [isModalOpen, editor, value]);

    useEffect(() => {
        if (!editor || isModalOpen) {
            return;
        }

        const currentHtml = editor.getHTML();
        if (value !== currentHtml && !editor.isFocused) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor, isModalOpen]);

    const handleCalculatorInsert = (insertValue: string) => {
        editor?.chain().focus().insertContent(insertValue).run();
        setShowCalculator(false);
    };

    const renderMathInHTML = (html: string): string => {
        if (!html) {
            return '';
        }

        let result = html;

        result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
            try {
                const rendered = katex.renderToString(formula.trim(), {
                    throwOnError: false,
                    displayMode: true,
                });
                return `<div class='math-block py-4 overflow-x-auto'>${rendered}</div>`;
            } catch {
                return match;
            }
        });

        result = result.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
            try {
                const rendered = katex.renderToString(formula.trim(), {
                    throwOnError: false,
                    displayMode: false,
                });
                return `<span class='math-inline px-1'>${rendered}</span>`;
            } catch {
                return match;
            }
        });

        return result;
    };

    const handleFormulaInsert = (latex: string, isBlock: boolean) => {
        if (!editor) {
            return;
        }

        const content = isBlock ? `$$${latex}$$` : `$${latex}$`;
        editor.chain().focus().insertContent(content).run();
        setIsMathModalOpen(false);
    };

    const handleModalDone = () => {
        if (!editor) {
            return;
        }

        const finalContent = isHtmlMode ? modalContent : editor.getHTML();
        if (isHtmlMode) {
            editor.commands.setContent(finalContent || '', false);
        }
        onChange(finalContent);
        setIsModalOpen(false);
    };

    const handleToggleHtmlMode = () => {
        if (!editor) {
            return;
        }

        if (isHtmlMode) {
            editor.commands.setContent(modalContent || '', false);
        } else {
            setModalContent(editor.getHTML());
        }

        setIsHtmlMode((prev) => !prev);
    };

    const EditorToolbar = ({ hideExpand = false }: { hideExpand?: boolean }) => {
        if (!editor) {
            return null;
        }

        return (
            <div className={'flex flex-wrap gap-2 bg-gray-50 p-2 rounded-t-lg border-b border-gray-200 items-center'}>
                <div className={'flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm'}>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('bold') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Bold'}
                    >
                        <span className={'font-bold text-sm'}>B</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('italic') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Italic'}
                    >
                        <span className={'italic text-sm font-serif'}>I</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('strike') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Strikethrough'}
                    >
                        <span className={'line-through text-sm'}>S</span>
                    </button>
                </div>

                <div className={'flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm'}>
                    {[1, 2, 3].map((level) => (
                        <button
                            key={level}
                            type={'button'}
                            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
                            className={`px-2 py-1 rounded text-xs font-black transition-all ${editor.isActive('heading', { level }) ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            H{level}
                        </button>
                    ))}
                </div>

                <div className={'flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm'}>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('bulletList') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Bullet List'}
                    >
                        <List className={'h-4 w-4'} />
                    </button>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('orderedList') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Ordered List'}
                    >
                        <ListOrdered className={'h-4 w-4'} />
                    </button>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('blockquote') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Quote'}
                    >
                        <Quote className={'h-4 w-4'} />
                    </button>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`p-1.5 rounded transition-all ${editor.isActive('codeBlock') ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title={'Code Block'}
                    >
                        <Code className={'h-4 w-4'} />
                    </button>
                </div>

                <div className={'flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm'}>
                    <button
                        type={'button'}
                        onClick={() => setIsMathModalOpen(true)}
                        className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-sm'}
                    >
                        <Sigma className={'h-3.5 w-3.5'} />
                        Formula
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setShowCalculator(true)}
                        className={'p-1.5 rounded text-orange-600 hover:bg-orange-50 transition-all'}
                        title={'Calculator'}
                    >
                        <Calculator className={'h-4 w-4'} />
                    </button>
                </div>

                <div className={'flex-1'} />

                <div className={'flex items-center gap-1'}>
                    <button
                        type={'button'}
                        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                        className={'p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all'}
                        title={'Clear Formatting'}
                    >
                        <Trash2 className={'h-4 w-4'} />
                    </button>

                    {!hideExpand && (
                        <button
                            type={'button'}
                            onClick={() => setIsModalOpen(true)}
                            className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg bg-gray-900 text-white hover:bg-black transition-all shadow-md'}
                        >
                            <Maximize2 className={'h-3.5 w-3.5'} />
                            Full Screen
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (!editor) {
        return <div className={'text-sm text-gray-500'}>Loading editor...</div>;
    }

    return (
        <div className={'space-y-3'}>
            <MathFormulaModal
                isOpen={isMathModalOpen}
                onClose={() => setIsMathModalOpen(false)}
                onInsert={handleFormulaInsert}
            />

            <div className={'relative'}>
                <div className={'flex items-center justify-between mb-2'}>
                    <label className={'block text-sm font-medium text-purple-700 flex items-center gap-2'}>
                        <span>📝 Description</span>
                        {isPreviewMode && <span className={'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full'}>Preview Mode</span>}
                    </label>
                </div>

                {!isPreviewMode ? (
                    !isModalOpen ? (
                        <div className={'flex flex-col border-2 border-purple-300 rounded-lg shadow-sm overflow-hidden bg-white'}>
                            <EditorToolbar />
                            <EditorContent
                                editor={editor}
                                className={'prose prose-sm max-w-none focus:outline-none p-4 min-h-[150px] bg-white pointer-events-auto'}
                            />
                        </div>
                    ) : (
                        <div className={'border-2 border-dashed border-purple-200 rounded-lg p-10 text-center bg-purple-50/50'}>
                            <div className={'flex flex-col items-center gap-3'}>
                                <div className={'p-3 bg-purple-100 rounded-full'}>
                                    <Maximize2 className={'h-6 w-6 text-purple-600'} />
                                </div>
                                <p className={'text-purple-700 font-semibold text-lg'}>Editor is active in full-screen</p>
                                <p className={'text-purple-500 text-sm'}>Please complete your editing in the modal window.</p>
                                <button
                                    type={'button'}
                                    onClick={() => setIsModalOpen(true)}
                                    className={'mt-2 px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700 transition-all'}
                                >
                                    Go back to full-screen
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div
                        className={'border-2 border-purple-300 rounded-lg bg-white prose prose-sm max-w-none p-4 min-h-[150px] overflow-y-auto shadow-inner'}
                        dangerouslySetInnerHTML={{ __html: renderMathInHTML(value || `<p class='text-gray-400'>No content yet...</p>`) }}
                    />
                )}

                <div className={'flex items-center gap-2 mt-3'}>
                    <button
                        type={'button'}
                        onClick={() => setIsPreviewMode((prev) => !prev)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-md ${isPreviewMode ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {isPreviewMode ? (
                            <>
                                <Edit2 className={'h-4 w-4'} />
                                Back to Edit
                            </>
                        ) : (
                            <>
                                <Eye className={'h-4 w-4'} />
                                Preview Content
                            </>
                        )}
                    </button>

                    {!isModalOpen && (
                        <button
                            type={'button'}
                            onClick={() => setIsModalOpen(true)}
                            className={'inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all'}
                        >
                            <Maximize2 className={'h-4 w-4'} />
                            Full Screen
                        </button>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className={'fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4'}>
                    <div className={'w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20'}>
                        <div className={'flex items-center justify-between bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-6 shadow-lg'}>
                            <div className={'flex items-center gap-4'}>
                                <div className={'p-2 bg-white/20 rounded-xl backdrop-blur-sm'}>
                                    <Edit2 className={'h-6 w-6 text-white'} />
                                </div>
                                <div>
                                    <h2 className={'text-2xl font-black text-white tracking-tight'}>Professional Editor</h2>
                                    <p className={'text-purple-100 text-xs font-medium opacity-80 uppercase tracking-widest'}>Mathematical & Rich Text Support</p>
                                </div>
                            </div>
                            <button
                                type={'button'}
                                onClick={() => setIsModalOpen(false)}
                                className={'rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all'}
                            >
                                <X className={'h-8 w-8'} />
                            </button>
                        </div>

                        <div className={'flex-1 overflow-y-auto bg-gray-50/50'}>
                            <div className={'p-6 h-full flex flex-col gap-4'}>
                                <div className={'flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200 shadow-sm'}>
                                    <div className={'flex items-center gap-2 p-1 bg-gray-100 rounded-xl'}>
                                        <button
                                            type={'button'}
                                            onClick={() => setIsPreviewMode(false)}
                                            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isPreviewMode ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Edit2 className={'h-4 w-4'} />
                                            Edit
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => setIsPreviewMode(true)}
                                            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${isPreviewMode ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Eye className={'h-4 w-4'} />
                                            Preview
                                        </button>
                                    </div>

                                    {!isPreviewMode && (
                                        <div className={'flex items-center gap-3'}>
                                            <span className={'text-xs font-black text-gray-400 uppercase tracking-tighter'}>Mode:</span>
                                            <button
                                                type={'button'}
                                                onClick={handleToggleHtmlMode}
                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest border-2 ${isHtmlMode ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-inner' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm hover:shadow-md'}`}
                                            >
                                                {isHtmlMode ? 'Switch to Visual' : 'Switch to HTML'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={'flex-1 flex flex-col min-h-0'}>
                                    {!isPreviewMode ? (
                                        isHtmlMode ? (
                                            <textarea
                                                className={'w-full h-full p-8 text-gray-800 bg-white rounded-3xl border-2 border-purple-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none font-mono text-sm leading-relaxed shadow-inner transition-all resize-none'}
                                                value={modalContent}
                                                onChange={(event) => setModalContent(event.target.value)}
                                                placeholder={'Write your raw HTML here...'}
                                            />
                                        ) : (
                                            <div className={'flex-1 flex flex-col bg-white border-2 border-purple-100 rounded-3xl overflow-hidden shadow-xl'}>
                                                <EditorToolbar hideExpand={true} />
                                                <div className={'flex-1 overflow-y-auto p-4 custom-scrollbar cursor-text'} onClick={() => editor.commands.focus()}>
                                                    <EditorContent
                                                        editor={editor}
                                                        className={'prose prose-sm md:prose-base max-w-none focus:outline-none min-h-full pb-20 pointer-events-auto'}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className={'flex-1 w-full p-10 bg-white rounded-3xl border-2 border-purple-100 overflow-y-auto prose prose-indigo max-w-none shadow-2xl custom-scrollbar'}>
                                            <div dangerouslySetInnerHTML={{ __html: renderMathInHTML(isHtmlMode ? modalContent : editor.getHTML()) }} />
                                        </div>
                                    )}
                                </div>

                                <div className={'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 p-8 rounded-3xl shadow-sm'}>
                                    <div className={'flex items-center gap-3 mb-6'}>
                                        <div className={'p-2 bg-indigo-600 rounded-lg'}>
                                            <Highlighter className={'h-5 w-5 text-white'} />
                                        </div>
                                        <h3 className={'font-black text-indigo-900 text-xl tracking-tight'}>Formatting Guide</h3>
                                    </div>

                                    <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'}>
                                        <div className={'space-y-3'}>
                                            <h4 className={'font-bold text-indigo-800 text-sm uppercase tracking-wider flex items-center gap-2'}>
                                                <Edit2 className={'h-4 w-4'} /> Text
                                            </h4>
                                            <ul className={'text-sm text-indigo-700/80 space-y-2 font-medium'}>
                                                <li>Bold, italic, and strikethrough</li>
                                                <li>Headings H1, H2, and H3</li>
                                                <li>Clear formatting when needed</li>
                                            </ul>
                                        </div>

                                        <div className={'space-y-3'}>
                                            <h4 className={'font-bold text-indigo-800 text-sm uppercase tracking-wider flex items-center gap-2'}>
                                                <List className={'h-4 w-4'} /> Structure
                                            </h4>
                                            <ul className={'text-sm text-indigo-700/80 space-y-2 font-medium'}>
                                                <li>Bullet and numbered lists</li>
                                                <li>Quotes for notes and hints</li>
                                                <li>Code blocks for syntax samples</li>
                                            </ul>
                                        </div>

                                        <div className={'space-y-3 lg:col-span-2'}>
                                            <h4 className={'font-bold text-indigo-800 text-sm uppercase tracking-wider flex items-center gap-2'}>
                                                <Plus className={'h-4 w-4'} /> Mathematics
                                            </h4>
                                            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                                <ul className={'text-sm text-indigo-700/80 space-y-2 font-medium'}>
                                                    <li>Inline formula: <code>{'$x^2$'}</code></li>
                                                    <li>Block formula: <code>{'$$\\int_a^b f(x)\\,dx$$'}</code></li>
                                                    <li>Use the formula picker for symbols</li>
                                                    <li>Use the calculator for quick inserts</li>
                                                </ul>
                                                <div className={'bg-white/50 p-3 rounded-xl border border-indigo-100'}>
                                                    <p className={'text-[10px] text-indigo-500 font-black uppercase mb-1'}>Live Example</p>
                                                    <div
                                                        className={'text-sm'}
                                                        dangerouslySetInnerHTML={{
                                                            __html: katex.renderToString('\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}', {
                                                                throwOnError: false,
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={'bg-white border-t border-gray-100 p-6 flex items-center justify-between shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]'}>
                            <div className={'flex items-center gap-3 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100'}>
                                <div className={'h-2 w-2 bg-green-500 rounded-full'} />
                                <span className={'text-xs font-bold uppercase tracking-wider'}>Live Editing Active</span>
                            </div>
                            <div className={'flex items-center gap-4'}>
                                <button
                                    type={'button'}
                                    onClick={() => setIsModalOpen(false)}
                                    className={'px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type={'button'}
                                    onClick={handleModalDone}
                                    className={'inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-4 text-white font-black text-sm uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-purple-200'}
                                >
                                    <Minimize2 className={'h-5 w-5'} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCalculator && (
                <ScientificCalculator
                    onInsert={handleCalculatorInsert}
                    onClose={() => setShowCalculator(false)}
                />
            )}

            <style>{`
                .math-block {
                    display: block;
                    text-align: center;
                    margin: 1.5em 0;
                    overflow-x: auto;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .math-inline {
                    display: inline;
                    padding: 0 4px;
                    color: #4338ca;
                    font-weight: 500;
                }

                .katex {
                    font-size: 1.1em;
                }

                .ProseMirror {
                    outline: none !important;
                }

                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }

                .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }

                .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }

                .ProseMirror li {
                    margin-bottom: 0.5rem;
                }

                .ProseMirror blockquote {
                    border-left: 4px solid #6366f1;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #4b5563;
                    background: #f3f4f6;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                }

                .ProseMirror pre {
                    background: #1f2937;
                    color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 8px;
                    font-family: 'Fira Code', monospace;
                    margin: 1.5rem 0;
                    overflow-x: auto;
                }

                .ProseMirror code {
                    background: #f3f4f6;
                    color: #ef4444;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.9em;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c7d2fe;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #818cf8;
                }
            `}</style>
        </div>
    );
};

export default RichDescriptionEditor;