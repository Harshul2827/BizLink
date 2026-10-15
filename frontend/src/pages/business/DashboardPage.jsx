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
    if (!window.confirm('Are you sure you want to remove this requirement?')) return;
    try {
      await api.delete(`/businesses/${activeBusiness.business_id}/needs/${needId}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete requirement');
    }
  };

  if (!activeBusiness && businesses.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-10 rounded-lg shadow-subtle space-y-4">
        <div className="w-14 h-14 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mx-auto border border-[#DBEAFE] dark:border-[#1E40AF]">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
          No Business Profile Found
        </h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
          To manage services, post commercial requirements, and connect with partners, please register your business profile.
        </p>
        <div className="pt-2">
          <Link
            to="/business/create"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Business Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-2">
      {/* ─── Business Top Banner ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-6 rounded-lg shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF] flex items-center justify-center font-bold text-xl shrink-0 shadow-subtle">
            {activeBusiness?.name ? activeBusiness.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                {activeBusiness?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDFA] dark:bg-[#042F2E] text-[#0F766E] dark:text-[#2DD4BF] border border-[#CCFBF1] dark:border-[#115E59]">
                {activeBusiness?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {[activeBusiness?.city, activeBusiness?.state, activeBusiness?.country].filter(Boolean).join(', ')} &bull; Enterprise Operations Console
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <Link
            to={`/business/${activeBusiness?.business_id}`}
            className="px-3.5 py-2 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155] shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Directory Profile</span>
          </Link>
          <Link
            to="/business/create"
            className="px-3.5 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors"
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
              <div className="p-1.5 rounded-md bg-[#EFF6FF] dark:bg-[#172554] text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-[#1E40AF]">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Services & Capabilities</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-mono font-semibold border border-[#E2E8F0] dark:border-[#334155]">
                {services.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('SERVICE');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center space-x-1 shadow-subtle transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {services.length === 0 ? (
              <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
                No active services listed yet. Click "+ Add Service" to publish company capabilities.
              </div>
            ) : (
              services.map((s) => (
                <div
                  key={s.service_id}
                  className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg flex items-center justify-between hover:border-[#2563EB]/40 transition-colors shadow-subtle"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-white">{s.title}</h3>
                    {(s.price_min != null || s.price_max != null) && (
                      <p className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-bold">
                        ${s.price_min || 0} - ${s.price_max || 'Custom'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setModalType('SERVICE');
                        setEditingItem(s);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#2563EB] hover:border-[#2563EB] hover:bg-[#EFF6FF] shadow-subtle transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.service_id)}
                      className="p-1.5 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#DC2626] hover:border-red-300 hover:bg-red-50 shadow-subtle transition-colors cursor-pointer"
                      title="Delete Service"
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
              <div className="p-1.5 rounded-md bg-[#F0FDFA] dark:bg-[#042F2E] text-[#0F766E] dark:text-[#2DD4BF] border border-[#CCFBF1] dark:border-[#115E59]">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Commercial Requirements</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-mono font-semibold border border-[#E2E8F0] dark:border-[#334155]">
                {needs.length}
              </span>
            </div>
            <button
              onClick={() => {
                setModalType('NEED');
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-md bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold flex items-center space-x-1 shadow-subtle transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Need</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {needs.length === 0 ? (
              <div className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-8 rounded-lg text-center text-[#64748B] dark:text-[#94A3B8] text-xs">
                No open commercial requirements published yet. Click "+ Post Need" to find suppliers and matching partners.
              </div>
            ) : (
              needs.map((n) => (
                <div
                  key={n.need_id}
                  className="bg-white dark:bg-[#131C2E] border border-[#E2E8F0] dark:border-[#22314A] p-4 rounded-lg flex items-center justify-between hover:border-[#14B8A6]/40 transition-colors shadow-subtle"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-white">{n.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {(n.budget_min != null || n.budget_max != null) && (
                        <span className="text-[#0F766E] dark:text-[#2DD4BF] font-bold">
                          Budget: ${n.budget_min || 0} - ${n.budget_max || 'Flexible'}
                        </span>
                      )}
                      {n.deadline && <span>Due: {n.deadline.slice(0, 10)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setModalType('NEED');
                        setEditingItem(n);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F766E] hover:border-[#0F766E] hover:bg-[#F0FDFA] shadow-subtle transition-colors cursor-pointer"
                      title="Edit Need"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNeed(n.need_id)}
                      className="p-1.5 rounded-md border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:text-[#DC2626] hover:border-red-300 hover:bg-red-50 shadow-subtle transition-colors cursor-pointer"
                      title="Delete Need"
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

