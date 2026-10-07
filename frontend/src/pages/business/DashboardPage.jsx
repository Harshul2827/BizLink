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
  CheckCircle2
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
      <div className="max-w-xl mx-auto my-12 text-center glass-card p-10 rounded-3xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
          No Business Profile Found
        </h2>
        <p className="text-sm text-surface-600 dark:text-surface-400">
          To manage services, post commercial requirements, and connect with peers, please set up your business profile.
        </p>
        <div>
          <Link
            to="/business/create"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create Business Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* ─── Business Top Banner ──────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                {activeBusiness?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {activeBusiness?.status}
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {[activeBusiness?.city, activeBusiness?.state, activeBusiness?.country].filter(Boolean).join(', ')} &bull; Primary Business Management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Link
            to={`/business/${activeBusiness?.business_id}`}
            className="px-4 py-2.5 rounded-xl glass text-xs font-semibold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center space-x-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Profile</span>
          </Link>
          <Link
            to="/business/create"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Business</span>
          </Link>
        </div>
      </div>

      {/* ─── Two-Column Section: Services vs Needs ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Services / Offers Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Services & Offers</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold">
                {services.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('SERVICE');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Offer</span>
            </button>
          </div>

          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-surface-500 text-xs">
                No active services listed yet. Click "+ Add Offer" to publish your capabilities.
              </div>
            ) : (
              services.map((s) => (
                <div key={s.service_id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-brand-500/30 transition-all">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{s.title}</h3>
                    {(s.price_min != null || s.price_max != null) && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ${s.price_min || 0} - ${s.price_max || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setModalType('SERVICE');
                        setEditingItem(s);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.service_id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Commercial Needs</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold">
                {needs.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('NEED');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-violet-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Need</span>
            </button>
          </div>

          <div className="space-y-3">
            {needs.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-surface-500 text-xs">
                No open needs published yet. Click "+ Post Need" to find suppliers and matching partners.
              </div>
            ) : (
              needs.map((n) => (
                <div key={n.need_id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-violet-500/30 transition-all">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{n.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-surface-500 dark:text-surface-400">
                      {(n.budget_min != null || n.budget_max != null) && (
                        <span className="text-violet-600 dark:text-violet-400 font-medium">
                          Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
                        </span>
                      )}
                      {n.deadline && <span>Due: {n.deadline.slice(0, 10)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setModalType('NEED');
                        setEditingItem(n);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNeed(n.need_id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
