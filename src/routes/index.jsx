import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";
import ScrollToTop from "../utils/ScrollToTop.jsx";

import MainLayout from "../layouts/MainLayout";

// Pages
import HomePage from "../pages/guest/Home/Home.jsx";
import Search from "../pages/guest/Search/Search.jsx";
import FAQ from "../pages/guest/FAQ/FAQ.jsx";
import Privacy from "../pages/guest/Privacy/Privacy.jsx";
import Terms from "../pages/guest/Terms/Terms.jsx";
import CampaignPage from "../pages/guest/Campaign/Campaign.jsx";
import OrganizationList from "../pages/guest/OrganizationList/OrganizationList.jsx";
import OrganizationDetail from "../pages/guest/OrganizationDetail/OrganizationDetail.jsx";
import CampaignList from "../pages/guest/CampaignList/CampaignList.jsx";
import CampaignDetail from "../pages/guest/CampaignDetail/CampaignDetail.jsx";
import CreateCampaign from "../pages/organization/CreateCampaign/CreateCampaign.jsx";
import NewsFeed from "../pages/guest/NewsFeed/NewsFeed.jsx";
import CreatePost from "../pages/user/CreatePost/CreatePost.jsx";
import Chat from "../pages/user/Chat/Chat.jsx";
import Profile from "../pages/user/Profile/Profile.jsx";
import RegisterOrg from "../pages/user/RegisterOrg/RegisterOrg.jsx"
import Donate from "../pages/user/Donate/Donate.jsx"
import DonateSuccess from "../pages/user/DonateSuccess/DonateSuccess.jsx"
import AdminPanel from "../pages/admin/AdminPanel/AdminPanel.jsx";
import Login from "../pages/auth/Login/Login.jsx";
import Register from "../pages/auth/Register/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword/Forgot.jsx";
// ================== PUBLIC ROUTES ==================
const publicRoutes = [
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/dang-nhap",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/dang-ky",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/quen-mat-khau",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/tim-kiem",
    element: (
      <PublicRoute>
        <Search />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/hoi-dap",
    element: (
      <PublicRoute>
        <FAQ />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/dieu-khoan",
    element: (
      <PublicRoute>
        <Terms />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/chinh-sach",
    element: (
      <PublicRoute>
        <Privacy />
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/danh-sach",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignList />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/chi-tiet/:id",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignDetail />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/bang-tin",
    element: (
      <PublicRoute>
          <NewsFeed />
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignPage />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/to-chuc",
    element: (
      <PublicRoute>
        <MainLayout>
          <OrganizationList />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/to-chuc/chi-tiet/:id",
    element: (
      <PublicRoute>
        <MainLayout>
          <OrganizationDetail />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/thanh-cong",
    element: (
      <PublicRoute>
          <DonateSuccess />
      </PublicRoute>
    ),
  },
];

// ================== PRIVATE ROUTES ==================
const privateRoutes = [
  {
    path: "/chien-dich/tao-moi",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CreateCampaign />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/bang-tin/tao-moi",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CreatePost />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dk-to-chuc",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegisterOrg />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chien-dich/ung-ho/:id",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Donate />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
];

// ================== APP ROUTES ==================
export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {privateRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* <Route path="/403" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </>
  );
}
