import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/navigation/TopBar';
import { NavDrawer } from './components/navigation/NavDrawer';
import { BottomNav } from './components/navigation/BottomNav';
import { SnackbarContainer } from './components/common/SnackbarContainer';
import { ConfirmDialogModal } from './components/common/ConfirmDialogModal';
import { FloatingPrayerCheckinButton } from './components/common/FloatingPrayerCheckinButton';

import { DashboardView } from './components/views/DashboardView';
import { StudentManagementView } from './components/views/StudentManagementView';
import { PrayerRecordingView } from './components/views/PrayerRecordingView';
import { HalaqahRecordingView } from './components/views/HalaqahRecordingView';
import { DisciplineRecordingView } from './components/views/DisciplineRecordingView';
import { ReportsView } from './components/views/ReportsView';
import { StudentProfileView } from './components/views/StudentProfileView';
import { SettingsView } from './components/views/SettingsView';
import { LoginPage } from './components/views/LoginPage';
import { MyAccountView } from './components/views/MyAccountView';
import { StudentPrayerCheckinView } from './components/views/StudentPrayerCheckinView';
import { ScheduleView } from './components/views/ScheduleView';
import { KhalifahInfoView } from './components/views/KhalifahInfoView';

function MainContent() {
  const { activeTab, isStudent } = useApp();
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return isStudent ? <StudentProfileView /> : <DashboardView />;
      case 'schedule':
        return <ScheduleView />;
      case 'khalifah_info':
        return <KhalifahInfoView />;
      case 'students':
        return <StudentManagementView />;
      case 'prayer':
        return <PrayerRecordingView />;
      case 'halaqah':
        return <HalaqahRecordingView />;
      case 'discipline':
        return <DisciplineRecordingView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <StudentProfileView />;
      case 'student_checkin':
        return <StudentPrayerCheckinView />;
      case 'my_account':
        return <MyAccountView />;
      case 'settings':
        return <SettingsView />;
      default:
        return isStudent ? <StudentProfileView /> : <DashboardView />;
    }
  };

  // Dedicated Landing Page Mode on clean white background
  if (activeTab === 'login') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center font-sans transition-colors p-4 sm:p-8">
        <main className="w-full flex-1 flex flex-col items-center justify-center">
          <LoginPage />
        </main>
        <SnackbarContainer />
        <ConfirmDialogModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header Bar */}
      <TopBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Navigation Drawer */}
        <NavDrawer />

        {/* Main View Container */}
        <main ref={mainRef} className="flex-1 p-4 md:p-6 pb-24 md:pb-12 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Common Floating UI Elements */}
      <FloatingPrayerCheckinButton />
      <SnackbarContainer />
      <ConfirmDialogModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
