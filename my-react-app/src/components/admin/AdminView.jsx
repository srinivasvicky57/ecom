import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, fetchProfile, authFetch } from "../../constants/auth";
import { SETTINGS_URL } from "../../constants/api";
import {
  ShoppingBagIcon,
  BarChartIcon,
  ArrowLeftIcon,
  DashboardIcon,
} from "../../assets/svgs";
import AdminBanner from "./AdminBanner";
import AdminCategory from "./AdminCategory";
import AdminAnalytics from "./AdminAnalytics";
import AdminCustomerInfo from "./AdminCustomerInfo";
import AdminProducts from "./AdminProducts";
import AdminProductCodeImages from "./AdminProductCodeImages";
import { useToast } from "../Toast";

const ADMIN_TABS = [
  {
    key: "manage",
    label: "Manage Store",
    icon: <ShoppingBagIcon width="18" height="18" />,
  },
  { key: "analytics", label: "Analytics", icon: <BarChartIcon /> },
];

const AdminView = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("manage");
  const [expanded, setExpanded] = useState({
    banner: false,
    category: false,
    productCodeImages: false,
    products: false,
    customerInfo: false,
  });
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const { addToast } = useToast();

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleMaintenanceToggle = async () => {
    const nextValue = !maintenanceEnabled;

    try {
      const res = await authFetch(`${SETTINGS_URL}/maintenance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: nextValue }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update maintenance mode');
      }

      setMaintenanceEnabled(nextValue);
      addToast(nextValue ? 'Maintenance mode enabled' : 'Maintenance mode cancelled', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    const loadMaintenanceState = async () => {
      try {
        const res = await fetch(`${SETTINGS_URL}/maintenance`);
        if (!res.ok) throw new Error('Failed to fetch maintenance state');
        const data = await res.json();
        setMaintenanceEnabled(Boolean(data.maintenanceMode));
      } catch {
        setMaintenanceEnabled(false);
      }
    };

    loadMaintenanceState();
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/profile");
      return;
    }
    fetchProfile()
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to verify admin");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user?.isAdmin) {
          setUserDetails(data.user);
        } else {
          navigate("/profile");
        }
      })
      .catch((err) => {
        addToast(err.message, "error");
        navigate("/profile");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="page-title-bar">
        <div className="admin-header-left">
          <button
            className="admin-back-btn"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeftIcon />
            <span>Back to Profile</span>
          </button>
          <h1 className="page-title-heading">
            <DashboardIcon />
            Admin Dashboard
          </h1>
        </div>
        <span className="page-title-badge">{userDetails?.name || "Admin"}</span>
      </div>

      <div className="admin-view-content">
        <div className="admin-content-inner">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              className="settings-action-btn"
              style={{
                background: maintenanceEnabled ? '#fbe9e9' : '#f2efe8',
                color: maintenanceEnabled ? '#8b1f1f' : '#2d4a2d',
                borderColor: maintenanceEnabled ? '#d7a0a0' : '#c5d1b5',
                fontWeight: 700,
              }}
              onClick={handleMaintenanceToggle}
            >
              {maintenanceEnabled ? 'Cancel Maintenance Mode' : 'Enable Maintenance Mode'}
            </button>
          </div>

          {/* Admin Tabs */}
          <div className="admin-tabs">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`admin-tab${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "manage" && (
            <div className="admin-manage-section">
              <div className="admin-accordion">
                <button
                  className={`admin-accordion-header${expanded.banner ? " open" : ""}`}
                  onClick={() => toggle("banner")}
                >
                  <span className="admin-accordion-title">
                    Banner Management
                  </span>
                  <svg
                    className="admin-accordion-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded.banner && (
                  <div className="admin-accordion-body">
                    <AdminBanner />
                  </div>
                )}
              </div>

              <div className="admin-accordion">
                <button
                  className={`admin-accordion-header${expanded.category ? " open" : ""}`}
                  onClick={() => toggle("category")}
                >
                  <span className="admin-accordion-title">
                    Category Management
                  </span>
                  <svg
                    className="admin-accordion-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded.category && (
                  <div className="admin-accordion-body">
                    <AdminCategory />
                  </div>
                )}
              </div>

              <div className="admin-accordion">
                <button
                  className={`admin-accordion-header${expanded.productCodeImages ? " open" : ""}`}
                  onClick={() => toggle("productCodeImages")}
                >
                  <span className="admin-accordion-title">Product Code and Image</span>
                  <svg
                    className="admin-accordion-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded.productCodeImages && (
                  <div className="admin-accordion-body">
                    <AdminProductCodeImages />
                  </div>
                )}
              </div>

              <div className="admin-accordion">
                <button
                  className={`admin-accordion-header${expanded.products ? " open" : ""}`}
                  onClick={() => toggle("products")}
                >
                  <span className="admin-accordion-title">Manage Products</span>
                  <svg
                    className="admin-accordion-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded.products && (
                  <div className="admin-accordion-body">
                    <AdminProducts />
                  </div>
                )}
              </div>

              <div className="admin-accordion">
                <button
                  className={`admin-accordion-header${expanded.customerInfo ? " open" : ""}`}
                  onClick={() => toggle("customerInfo")}
                >
                  <span className="admin-accordion-title">
                    Customer Care Info
                  </span>
                  <svg
                    className="admin-accordion-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3.5 5.25L7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded.customerInfo && (
                  <div className="admin-accordion-body">
                    <AdminCustomerInfo />
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "analytics" && <AdminAnalytics addToast={addToast} />}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
