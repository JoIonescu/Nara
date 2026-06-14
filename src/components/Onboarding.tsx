import React, { useState } from "react";
import NaraLogo from "./NaraLogo";
import InteractiveTutorialVideo from "./InteractiveTutorialVideo";
import { FontOption, ThemeOption, SupportMode, UserPreferences } from "../types";
import { Sparkles, Sliders, ChevronRight, Check } from "lucide-react";

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [font, setFont] = useState<FontOption>("Lexend");
  const [textSize, setTextSize] = useState<number>(20);
  const [lineSpacing, setLineSpacing] = useState<number>(1.6);
  const [theme, setTheme] = useState<ThemeOption>("cream");
  const [support, setSupport] = useState<SupportMode>("read-audio");
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  const fontClasses: Record<FontOption, string> = {
    Lexend: "font-lexend",
    OpenDyslexic: "font-dyslexic",
    Atkinson: "font-atkinson",
    Inter: "font-inter",
  };

  const themeClasses: Record<ThemeOption, string> = {
    cream: "bg-[#F7F4EE] text-[#111111] border-[#C5C2B8]",
    yellow: "bg-[#FFFDE5] text-[#000000] border-[#D2CCA9]",
    blue: "bg-[#EEF5FA] text-[#0A192F] border-[#AFC3D4]",
    sepia: "bg-[#F4EAD4] text-[#2D1910] border-[#CCD2B8]",
    dark: "bg-[#121214] text-[#FFFFFF] border-[#383A40]",
  };

  const isDark = theme === "dark";
  const isYellow = theme === "yellow";
  const isBlue = theme === "blue";
  const isSepia = theme === "sepia";

  const pageBgClass = isDark 
    ? "bg-[#121214] text-[#E1E4EA]" 
    : isYellow 
    ? "bg-[#FFFDE5] text-[#1D1B11]" 
    : isBlue 
    ? "bg-[#EEF5FA] text-[#1B2A4A]" 
    : isSepia 
    ? "bg-[#F4EAD4] text-[#3E2723]" 
    : "bg-[#F7F4EE] text-[#111111]";

  const borderClass = isDark 
    ? "border-[#2D3139]" 
    : isYellow 
    ? "border-[#D2CCA9]" 
    : isBlue 
    ? "border-[#AFC3D4]" 
    : isSepia 
    ? "border-[#CCD2B8]" 
    : "border-[#DCD9D0]";

  const cardBgClass = isDark 
    ? "bg-[#1C1E22]/95 border-[#2D3139] text-[#E1E4EA]" 
    : isYellow 
    ? "bg-white border-[#E8E3CD]" 
    : isBlue 
    ? "bg-white border-[#D0DFEB]" 
    : isSepia 
    ? "bg-[#FDFBF4] border-[#DFCEB3]" 
    : "bg-white border-[#DCD9D0]";

  const textPrimary = isDark ? "text-white" : isYellow ? "text-black" : isBlue ? "text-[#0A192F]" : isSepia ? "text-[#2D1910]" : "text-[#111111]";
  const textSecondary = isDark ? "text-[#BAC1CC]" : isYellow ? "text-[#2F2A15]" : isBlue ? "text-[#1E2D4A]" : isSepia ? "text-[#4A3525]" : "text-[#444444]";
  const textTertiary = isDark ? "text-[#7B818F]" : isYellow ? "text-[#5D5030]" : isBlue ? "text-[#4A5B7E]" : isSepia ? "text-[#6D5A4E]" : "text-[#666666]";

  const sampleText =
    "The way we read shouldn't be fixed. Some of us need wider spacing, others need larger letters or specialized fonts. With dynamic focus modes and audio assistance, you can build your own comfortable visual path.";

  const handleFinish = () => {
    onComplete({
      letterSpacing: 0.05,
      wordSpacing: 0.1,
      bionicReading: false,
      syllableBreaking: false,
      font,
      textSize,
      lineSpacing,
      theme,
      support,
      reduceMotion,
    });
  };

  return (
    <div id="onboarding-root" className={`min-h-screen ${pageBgClass} font-sans flex flex-col justify-between py-12 px-6 transition-all duration-300`}>
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start my-auto">
        
        {/* Left Interactive Configuration Screen */}
        <div id="config-col" className={`md:col-span-7 backdrop-blur-sm p-8 rounded-2xl shadow-md flex flex-col min-h-[480px] justify-between transition-all duration-300 border ${cardBgClass}`}>
          <div>
            <div className={`flex items-center justify-between mb-6 border-b pb-4 ${borderClass}`}>
              <NaraLogo showText={true} size="sm" />
              <div className={`text-xs font-bold ${textTertiary}`}>Step {step} of 7</div>
            </div>

            {/* Step 1: Welcome Screen (with Built-in Interactive Tutorial Tour) */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">
                  Reading should adapt <span className="text-[#5B8FB9]">to you</span>.
                </h1>
                
                <p className="text-[#444444] text-xs leading-relaxed">
                  Traditional interfaces can feel exhausting. Incluread adapts to your eye comfort, cognitive pacing, and focus confidence. Watch our brief video tutorial tour below:
                </p>

                {/* PREMIUM ACCESSIBLE INTERACTIVE TOUR VIDEO */}
                <div className="my-2">
                  <InteractiveTutorialVideo />
                </div>

                <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#DCD9D0] text-[11px] text-[#444444] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#5B8FB9] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Next Setup Steps:</p>
                    <p className="text-[#666666]">We will help customize your favorite fonts, sizing bounds, contrast palettes, and active helpers.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Choose Font */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#5B8FB9]" /> Select reading typeface
                </h2>
                <p className="text-xs text-[#666666]">
                  Choose typefaces designed to prevent mirroring, letter swapping, or visual crowding.
                </p>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "Lexend", title: "Lexend", desc: "For scanning comfort" },
                    { id: "OpenDyslexic", title: "OpenDyslexic", desc: "Weighted bottom lines" },
                    { id: "Atkinson", title: "Atkinson Hyperlegible", desc: "Strict letter distinction" },
                    { id: "Inter", title: "Inter Sans", desc: "Classic proportion balance" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id as FontOption)}
                      className={`text-left p-4 rounded-xl border transition-all hover:border-[#5B8FB9] ${
                        font === f.id
                          ? "bg-[#5B8FB9]/10 border-[#5B8FB9] ring-2 ring-[#5B8FB9]/30"
                          : "bg-white border-[#DCD9D0]"
                      }`}
                    >
                      <p className={`text-base font-bold text-[#222222] ${fontClasses[f.id as FontOption]}`}>
                        {f.title}
                      </p>
                      <p className="text-[11px] text-[#888888] mt-1">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Text Size Slider */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold text-[#222222]">Adjust comfortable size</h2>
                <p className="text-xs text-[#666666]">
                  Larger fonts alleviate strain, while keeping text size scalable for mobile devices.
                </p>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-4">
                  <div className="flex justify-between w-full text-xs font-bold text-[#666666]">
                    <span>Standard (16px)</span>
                    <span className="text-[#5B8FB9] text-base">{textSize}px</span>
                    <span>Generous (36px)</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#DCD9D0] rounded-lg appearance-none cursor-pointer accent-[#5B8FB9]"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Line Spacing Slider */}
            {step === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold text-[#222222]">Configure vertical spacing</h2>
                <p className="text-xs text-[#666666]">
                  Generous line height prevents getting lost or accidentally skipping lines.
                </p>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-4">
                  <div className="flex justify-between w-full text-xs font-bold text-[#666666]">
                    <span>Compact (1.2)</span>
                    <span className="text-[#5B8FB9] text-base">{lineSpacing}x</span>
                    <span>Relaxed (2.5)</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#DCD9D0] rounded-lg appearance-none cursor-pointer accent-[#5B8FB9]"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Themes Selection */}
            {step === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold text-[#222222]">Select page contrast theme</h2>
                <p className="text-xs text-[#666666]">
                  We strictly avoid pure black and pure white to reduce visual shock and high glare.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: "cream", label: "Organic Cream", code: "#F7F4EE" },
                    { id: "yellow", label: "Soft Yellow", code: "#FFFDE5" },
                    { id: "blue", label: "Soft Ice Blue", code: "#EEF5FA" },
                    { id: "sepia", label: "Sepia Warmth", code: "#F4EAD4" },
                    { id: "dark", label: "Midnight Grey", code: "#1E1F22" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as ThemeOption)}
                      className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2 ${
                        theme === t.id
                          ? "border-[#5B8FB9] ring-2 ring-[#5B8FB9]/40 bg-gray-50"
                          : "border-[#DCD9D0] bg-white"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 inline-block flex-shrink-0"
                        style={{ backgroundColor: t.code }}
                      />
                      <span className="text-xs font-bold truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Reading Support Preference */}
            {step === 6 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold text-[#222222]">Choose your support mode</h2>
                <p className="text-xs text-[#666666]">
                  Let us pre-configure interactive playback, audio narration, and tracking rulers.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      id: "read-only",
                      title: "Read Only",
                      desc: "For distraction-free independent text study with active visual guides.",
                    },
                    {
                      id: "read-audio",
                      title: "Read + Live Audio Synth",
                      desc: "Ideal read-along helper. Sentences and words highlight synchronized in real-time.",
                    },
                    {
                      id: "audio-first",
                      title: "Audio First Mode",
                      desc: "Focus primarily on listen-along tracks with large font annotations.",
                    },
                  ].map((sm) => (
                    <button
                      key={sm.id}
                      onClick={() => setSupport(sm.id as SupportMode)}
                      className={`w-full text-left p-4 rounded-xl border transition-all hover:border-[#5B8FB9] flex items-center justify-between ${
                        support === sm.id
                          ? "bg-[#5B8FB9]/10 border-[#5B8FB9] ring-1 ring-[#5B8FB9]"
                          : "bg-white border-[#DCD9D0]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#222222]">{sm.title}</p>
                        <p className="text-xs text-[#777777] mt-1 pr-4">{sm.desc}</p>
                      </div>
                      {support === sm.id && (
                        <Check className="w-5 h-5 text-[#5B8FB9] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Finish Page */}
            {step === 7 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-2xl font-black text-[#5B8FB9]">Settings Compiled!</h2>
                <p className="text-[#333333] leading-relaxed text-sm">
                  Your reading workspace is fully customized. These layout ratios, fonts, sizes and tone templates will be locked across your device library profiles automatically.
                </p>

                <div className="p-4 bg-[#EEF5FA] rounded-xl border border-[#D0DFEB] space-y-2 text-xs">
                  <p className="font-bold text-[#1B2A4A]">Saved Profile Summary:</p>
                  <div className="grid grid-cols-2 gap-1 text-[#444444]">
                    <div>Font: <span className="font-bold">{font}</span></div>
                    <div>Text Size: <span className="font-bold">{textSize}px</span></div>
                    <div>Theme: <span className="font-bold capitalize">{theme}</span></div>
                    <div>Spacing: <span className="font-bold">{lineSpacing}x</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-[#666666]">
                  <input
                    id="mot-red"
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#5B8FB9]"
                  />
                  <label htmlFor="mot-red">Enable WCAG Reduce Motion mode (fewer fade animations)</label>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding Navigation controls */}
          <div className="flex justify-between items-center pt-8 border-t border-[#EAE7DF] mt-6">
            <span className="text-xs font-bold text-gray-400">
              Step {step} of 7
            </span>
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-[#DCD9D0] bg-white rounded-xl text-xs font-bold hover:bg-gray-50 focus:outline-none"
                >
                  Previous
                </button>
              )}
              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 bg-[#5B8FB9] text-white font-bold text-xs rounded-xl hover:bg-[#497A9E] shadow-sm flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-[#5B8FB9] text-white font-black text-xs rounded-xl hover:bg-green-700 shadow-md uppercase tracking-wider"
                >
                  Start Reading Platform
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Live Preview panel */}
        <div id="sticky-preview" className={`md:col-span-5 sticky top-8 p-6 rounded-2xl shadow-sm transition-all duration-300 border ${cardBgClass}`}>
          <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-4 ${isDark ? 'text-[#BAC1CC]' : 'text-[#777777]'}`}>
            Live Preview Screen
          </h3>

          <div
            id="preview-window"
            className={`p-6 rounded-xl border transition-all h-[340px] overflow-y-auto no-scrollbar ${themeClasses[theme]}`}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-black/5 opacity-80">
              <span className="text-[10px] uppercase font-bold tracking-wider">Book Preview</span>
              <span className="text-[10px] font-bold">Lex. Reading Engine</span>
            </div>
            
            <p
              style={{
                fontSize: `${textSize}px`,
                lineHeight: lineSpacing,
              }}
              className={`transition-all break-words ${fontClasses[font]}`}
            >
              {sampleText}
            </p>
          </div>

          <div className={`mt-4 p-3 rounded-xl border text-center text-[10px] font-semibold transition-all duration-300 ${isDark ? 'bg-[#2A2B35] border-[#383A40] text-stone-300' : 'bg-[#F7F4EE] border-[#DCD9D0] text-[#555555]'}`}>
            Watch the font weight, sizes, list distance, and ambient backdrops interact instantly as you choose.
          </div>
        </div>

      </div>
    </div>
  );
}