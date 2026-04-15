import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { CallCenter } from './pages/CallCenter';
import { TeamDirectory } from './pages/TeamDirectory';
import { Activity } from './pages/Activity';
import { Teams } from './pages/Teams';
import CallHistory from './pages/CallHistory';
import LiveMonitoring from './pages/LiveMonitoring';
import Analytics from './pages/Analytics';
import { Numbers } from './pages/settings/Numbers';
import { SettingsPlaceholder } from './pages/settings/SettingsPlaceholder';
import { CallSettings } from './pages/settings/CallSettings';
import { Integrations } from './pages/settings/Integrations';
import { MainLayout } from './components/MainLayout';
import { Contacts } from './pages/Contacts';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/dashboard',
    element: (
      <MainLayout>
        <CallCenter />
      </MainLayout>
    ),
  },
  {
    path: '/contacts',
    element: (
      <MainLayout>
        <Contacts />
      </MainLayout>
    ),
  },
  {
    path: '/numbers',
    element: (
      <MainLayout>
        <Numbers />
      </MainLayout>
    ),
  },
  {
    path: '/teams',
    element: (
      <MainLayout>
        <Teams />
      </MainLayout>
    ),
  },
  {
    path: '/monitoring',
    element: (
      <MainLayout>
        <LiveMonitoring />
      </MainLayout>
    ),
  },
  {
    path: '/analytics',
    element: (
      <MainLayout>
        <Analytics />
      </MainLayout>
    ),
  },
  {
    path: '/team-directory',
    element: (
      <MainLayout>
        <TeamDirectory />
      </MainLayout>
    ),
  },
  {
    path: '/call-history',
    element: (
      <MainLayout>
        <CallHistory />
      </MainLayout>
    ),
  },
  {
    path: '/activity',
    element: (
      <MainLayout>
        <Activity />
      </MainLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <MainLayout>
        <CallSettings />
      </MainLayout>
    ),
  },
  {
    path: '/settings/call-settings',
    element: (
      <MainLayout>
        <CallSettings />
      </MainLayout>
    ),
  },
  {
    path: '/settings/integrations',
    element: (
      <MainLayout>
        <Integrations />
      </MainLayout>
    ),
  },
]);