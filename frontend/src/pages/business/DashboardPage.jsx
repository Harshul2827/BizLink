import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import ServiceNeedModal from '../../components/business/ServiceNeedModal';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Target,
  ExternalLink,
  Users2,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { activeBusiness, businesses } = useAuth();
  const [services, setServices] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('SERVICE');
  const [editingItem, setEditingItem] = useState(null);

  const loadData = useCallback(async () => {
    if (!activeBusiness?.business_id) return;
    try {
      setLoading(true);
      const [srvRes, needRes] = await Promise.allSettled([
        api.get(`/businesses/${activeBusiness.business_id}/services`),
        api.get(`/businesses/${activeBusiness.business_id}/needs`)
      ]);

      if (srvRes.status === 'fulfilled') setServices(srvRes.value.data || []);
      if (needRes.status === 'fulfilled') setNeeds(needRes.value.data || []);
    } catch (err) {
      console.warn('Error loading business items:', err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await api.delete(`/businesses/${activeBusiness.business_id}/services/${serviceId}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete service');
    }
  };

  const handleDeleteNeed = async (needId) => {
    if (!window.confirm('Are you sure you want to remove this need?')) return;
    try {
      await api.delete(`/businesses/${activeBusiness.business_id}/needs/${needId}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete need');
    }
  };

  if (!activeBusiness && businesses.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-10 rounded-2xl shadow-enterprise space-y-4">
        <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white">
          No Business Profile Found
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          To manage services, post commercial requirements, and connect with peers, please set up your business profile.
        </p>
        <div className="pt-2">
          <Link
            to="/business/create"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Business Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* ─── Business Top Banner ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-enterprise flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-surface-900 dark:text-white">
                {activeBusiness?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {activeBusiness?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {[activeBusiness?.city, activeBusiness?.state, activeBusiness?.country].filter(Boolean).join(', ')} &bull; Primary Business Console
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <Link
            to={`/business/${activeBusiness?.business_id}`}
            className="px-3.5 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-xs font-semibold text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Profile</span>
          </Link>
          <Link
            to="/business/create"
            className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Business</span>
          </Link>
        </div>
      </div>

      {/* ─── Two-Column Section: Services vs Needs ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Services / Offers Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Services & Capabilities</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold border border-surface-200 dark:border-surface-700">
                {services.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('SERVICE');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {services.length === 0 ? (
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-xl text-center text-surface-500 dark:text-surface-400 text-xs">
                No active services listed yet. Click "+ Add Service" to publish your company's offerings.
              </div>
            ) : (
              services.map((s) => (
                <div key={s.service_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex items-center justify-between hover:border-brand-600/40 transition-colors shadow-sm">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-surface-900 dark:text-white">{s.title}</h3>
                    {(s.price_min != null || s.price_max != null) && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                        ${s.price_min || 0} - ${s.price_max || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setModalType('SERVICE');
                        setEditingItem(s);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.service_id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commercial Needs Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-accent-500 border border-teal-100 dark:border-teal-900">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Commercial Needs</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold border border-surface-200 dark:border-surface-700">
                {needs.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('NEED');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Need</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {needs.length === 0 ? (
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-8 rounded-xl text-center text-surface-500 dark:text-surface-400 text-xs">
                No open needs published yet. Click "+ Post Need" to find suppliers and matching partners.
              </div>
            ) : (
              needs.map((n) => (
                <div key={n.need_id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex items-center justify-between hover:border-accent-500/40 transition-colors shadow-sm">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-surface-900 dark:text-white">{n.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-surface-500 dark:text-surface-400">
                      {(n.budget_min != null || n.budget_max != null) && (
                        <span className="text-accent-600 dark:text-accent-400 font-medium">
                          Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
                        </span>
                      )}
                      {n.deadline && <span>Due: {n.deadline.slice(0, 10)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setModalType('NEED');
                        setEditingItem(n);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNeed(n.need_id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ─── Modal for Add/Edit Service or Need ───────────────────────── */}
      <ServiceNeedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        businessId={activeBusiness?.business_id}
        initialData={editingItem}
        onSuccess={loadData}
      />
    </div>
  );
}
