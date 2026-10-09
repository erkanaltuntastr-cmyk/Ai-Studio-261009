import React, { useState } from 'react';
import { Settings, Shield, Award, BarChart3, Download, RefreshCw, X, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { UserStore, DifficultyLevel, OperationType, DivisionLayout, GuideMode } from '../types/math';
import { formatRewardTime, exportAsText, exportAsJson } from '../core/storage';

interface ParentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  store: UserStore;
  onUpdateStore: (updated: UserStore) => void;
}

export const ParentMenu: React.FC<ParentMenuProps> = ({
  isOpen,
  onClose,
  store,
  onUpdateStore,
}) => {
  const [lang, setLang] = useState<'tr' | 'en'>(store.settings.parentLanguage || 'tr');

  if (!isOpen) return null;

  const t = {
    tr: {
      title: 'Ebeveyn & Öğretmen Paneli',
      subtitle: "Ela'nın (Year 5) İlerleme, Ayarlar ve Teşhis Raporu",
      levelsTab: 'Zorluk Seviyeleri',
      settingsTab: 'Pedagojik Ayarlar',
      diagnosticsTab: 'Hata Teşhis Analizi',
      rewardTab: 'Ödül Zaman Kumbarası',
      exportTab: 'Rapor İndir',
      divisionLayout: 'Bölme Düzeni',
      busStop: 'Bus Stop (Okul standardı)',
      longSteps: 'Long Steps (Adım adım çıkarma)',
      guides: 'Kılavuz ve İpuçları',
      guideAuto: 'Otomatik (Başarıya göre azalır)',
      guideOn: 'Her Zaman Açık',
      guideOff: 'Kapalı (Sınav hissi)',
      sound: 'Ses Efektleri',
      soundOn: 'Açık (Yumuşak dokunuş sesleri)',
      soundOff: 'Kapalı (Sessiz)',
      exportTxt: 'Metin Raporu İndir (.txt)',
      exportJson: 'Ham Veri İndir (.json)',
      close: 'Deftere Dön',
      rewardReset: 'Ödülü Sıfırla (Kullanıldı)',
      rewardAdd10: '+10 Dk Ekle',
    },
    en: {
      title: 'Parent & Teacher Dashboard',
      subtitle: "Ela's (Year 5) Progress, Settings & Pedagogical Diagnostics",
      levelsTab: 'Difficulty Levels',
      settingsTab: 'Pedagogical Settings',
      diagnosticsTab: 'Diagnostic Weak Spots',
      rewardTab: 'Reward Time Bank',
      exportTab: 'Export Reports',
      divisionLayout: 'Division Layout',
      busStop: 'Bus Stop (UK Standard)',
      longSteps: 'Long Steps (Vertical chunking)',
      guides: 'Guides & Prompts',
      guideAuto: 'Auto (Fades with mastery)',
      guideOn: 'Always On',
      guideOff: 'Off (Test conditions)',
      sound: 'Audio Effects',
      soundOn: 'Enabled (Gentle soft clicks)',
      soundOff: 'Disabled (Muted)',
      exportTxt: 'Download Text Report (.txt)',
      exportJson: 'Download Raw JSON (.json)',
      close: 'Back to Notebook',
      rewardReset: 'Reset Reward (Used)',
      rewardAdd10: '+10 Mins Reward',
    },
  }[lang];

  const handleLevelChange = (op: OperationType, newLevel: DifficultyLevel) => {
    const updated = {
      ...store,
      levels: {
        ...store.levels,
        [op]: newLevel,
      },
    };
    onUpdateStore(updated);
  };

  const handleDivisionChange = (layout: DivisionLayout) => {
    const updated = {
      ...store,
      settings: {
        ...store.settings,
        divisionLayout: layout,
      },
    };
    onUpdateStore(updated);
  };

  const handleGuideChange = (guide: GuideMode) => {
    const updated = {
      ...store,
      settings: {
        ...store.settings,
        guideMode: guide,
      },
    };
    onUpdateStore(updated);
  };

  const handleSoundToggle = () => {
    const updated = {
      ...store,
      settings: {
        ...store.settings,
        soundEnabled: !store.settings.soundEnabled,
      },
    };
    onUpdateStore(updated);
  };

  const handleAdjustReward = (deltaSeconds: number) => {
    const updated = {
      ...store,
      rewardSeconds: Math.max(0, store.rewardSeconds + deltaSeconds),
    };
    onUpdateStore(updated);
  };

  const handleResetReward = () => {
    const updated = {
      ...store,
      rewardSeconds: 0,
    };
    onUpdateStore(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans">{t.title}</h2>
              <p className="text-slate-400 text-xs">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextLang = lang === 'tr' ? 'en' : 'tr';
                setLang(nextLang);
                onUpdateStore({
                  ...store,
                  settings: { ...store.settings, parentLanguage: nextLang },
                });
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              {lang === 'tr' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Curriculum Levels */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{t.levelsTab}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['addition', 'subtraction', 'multiplication', 'division'] as OperationType[]).map((op) => (
                <div key={op} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm capitalize text-slate-900">{op}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      {store.levels[op].toUpperCase()}
                    </span>
                  </div>
                  <select
                    value={store.levels[op]}
                    onChange={(e) => handleLevelChange(op, e.target.value as DifficultyLevel)}
                    className="w-full text-xs font-medium p-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy (Year 4-5 warmup)</option>
                    <option value="medium">Medium (Year 5 core)</option>
                    <option value="hard">Hard (Year 5 mastery)</option>
                    <option value="very_hard">Very Hard (Year 6 stretch)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Pedagogical Settings */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>{t.settingsTab}</span>
            </div>
            <div className="space-y-3">
              {/* Division Layout */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{t.divisionLayout}</p>
                  <p className="text-xs text-slate-500">Choose between UK bus stop bracket or vertical steps</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDivisionChange('bus_stop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      store.settings.divisionLayout === 'bus_stop'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.busStop}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDivisionChange('long_steps')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      store.settings.divisionLayout === 'long_steps'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.longSteps}
                  </button>
                </div>
              </div>

              {/* Guides */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{t.guides}</p>
                  <p className="text-xs text-slate-500">Multipliers, multiples strip and directional hints</p>
                </div>
                <div className="flex gap-1.5">
                  {(['auto', 'on', 'off'] as GuideMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleGuideChange(mode)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
                        store.settings.guideMode === mode
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {store.settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{t.sound}</p>
                    <p className="text-xs text-slate-500">
                      {store.settings.soundEnabled ? t.soundOn : t.soundOff}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    store.settings.soundEnabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {store.settings.soundEnabled ? 'Active' : 'Muted'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Weak Spots Radar */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-rose-600" />
              <span>{t.diagnosticsTab}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              {Object.keys(store.weakSpots).length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Henüz kayıtlı hata kalıbı yok. Ela işlemleri başarıyla tamamlıyor!
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(store.weakSpots).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {count} times
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Reward Bank */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{t.rewardTab}</span>
            </div>
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-amber-900 font-semibold uppercase">Total Accumulated Reward Bank</p>
                <p className="text-3xl font-mono font-bold text-amber-950">
                  {formatRewardTime(store.rewardSeconds)}
                </p>
                <p className="text-xs text-amber-800">
                  Today's earnings: {formatRewardTime(store.todayRewardSeconds)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustReward(600)}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold border border-amber-300"
                >
                  {t.rewardAdd10}
                </button>
                <button
                  type="button"
                  onClick={handleResetReward}
                  className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200"
                >
                  {t.rewardReset}
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Export Reports */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{t.exportTab}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => exportAsText(store)}
                className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl font-semibold text-xs text-slate-800 shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t.exportTxt}</span>
              </button>
              <button
                type="button"
                onClick={() => exportAsJson(store)}
                className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl font-semibold text-xs text-slate-800 shadow-xs"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{t.exportJson}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
