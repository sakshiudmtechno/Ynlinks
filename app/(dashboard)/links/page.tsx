'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus, X, GripVertical, Edit, Eye, EyeOff, Trash2, BarChart3, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface Link {
  _id: string;
  title: string;
  url: string;
  description?: string;
  thumbnailUrl?: string;
  enabled: boolean;
  clicks: number;
  orderIndex: number;
  userId: string;
}

export default function LinksPage() {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    thumbnailUrl: '',
    enabled: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const profile = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || '' });
  const linksData = useQuery(api.links.getLinksByUser, { userId: profile?._id || '' });

  const createLinkMutation = useMutation(api.links.createLink);
  const updateLinkMutation = useMutation(api.links.updateLink);
  const deleteLinkMutation = useMutation(api.links.deleteLink);
  const toggleLinkMutation = useMutation(api.links.toggleLinkEnabled);
  const reorderLinksMutation = useMutation(api.links.reorderLinks);

  const links = (linksData || []) as any[];

  const handleOpenModal = (link?: Link) => {
    if (!link && links.length >= 5) {
      alert('Maximum 5 links allowed. Please delete an existing link before creating a new one.');
      return;
    }

    if (link) {
      setEditingLink(link);
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description || '',
        thumbnailUrl: link.thumbnailUrl || '',
        enabled: link.enabled,
      });
    } else {
      setEditingLink(null);
      setFormData({ title: '', url: '', description: '', thumbnailUrl: '', enabled: true });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLink(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try { new URL(formData.url); } catch { newErrors.url = 'Enter valid URL with https://'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !profile) return;
    setLoading(true);
    try {
      if (editingLink) {
        await updateLinkMutation({
          linkId: editingLink._id,
          title: formData.title,
          url: formData.url,
          description: formData.description || undefined,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          enabled: formData.enabled,
        });
      } else {
        await createLinkMutation({
          userId: profile._id,
          title: formData.title,
          url: formData.url,
          description: formData.description || undefined,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          enabled: formData.enabled,
        });
      }
      handleCloseModal();
    } catch (error: any) { alert(error.message); }
    finally { setLoading(false); }
  };

  const handleToggle = async (linkId: string, enabled: boolean) => {
    try { await toggleLinkMutation({ linkId: linkId as any, enabled: !enabled }); }
    catch (error: any) { alert(error.message); }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Delete this link?')) return;
    try { await deleteLinkMutation({ linkId: linkId as any }); }
    catch (error: any) { alert(error.message); }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) { setDraggedItem(null); setDragOverItem(null); return; }
    const currentLinks = [...links].sort((a, b) => a.orderIndex - b.orderIndex);
    const draggedIndex = currentLinks.findIndex((l) => l._id === draggedItem);
    const targetIndex = currentLinks.findIndex((l) => l._id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newOrder = [...currentLinks];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    try { await reorderLinksMutation({ userId: profile?._id || '', linkIds: newOrder.map((l) => l._id as any) }); }
    catch (error) { console.error('Failed to reorder:', error); }
    setDraggedItem(null); setDragOverItem(null);
  };

  const activeLinks = links.filter((l) => l.enabled).sort((a, b) => a.orderIndex - b.orderIndex);
  const archivedLinks = links.filter((l) => !l.enabled).sort((a, b) => a.orderIndex - b.orderIndex);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2EE6A6]"></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" size={16} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111111]">My Links</h1>
            <p className="text-xs text-[#6B7280]">{links.length}/5 links</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={links.length >= 5}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            links.length >= 5 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695]'
          }`}
        >
          <Plus size={16} />
          Add Link
        </button>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="w-12 h-12 bg-[#2EE6A6]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Plus className="text-[#2EE6A6]" size={24} />
          </div>
          <h3 className="font-semibold text-[#111111] mb-1">No links yet</h3>
          <p className="text-xs text-[#6B7280] mb-4">Add your first link to start earning!</p>
          <button onClick={() => handleOpenModal()} className="bg-[#2EE6A6] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1FD695]">
            Add First Link
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activeLinks.map((link) => (
            <div
              key={link._id}
              draggable
              onDragStart={(e) => { setDraggedItem(link._id); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverItem(link._id); }}
              onDrop={(e) => handleDrop(e, link._id)}
              onDragEnd={() => { setDraggedItem(null); setDragOverItem(null); }}
              className={`bg-white rounded-xl border transition-all ${
                draggedItem === link._id ? 'opacity-50 border-[#2EE6A6]' : dragOverItem === link._id ? 'border-[#2EE6A6] border-2' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"><GripVertical size={16} /></div>
                {link.thumbnailUrl && (
                  <img src={link.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#111111] truncate">{link.title}</p>
                  <p className="text-xs text-[#6B7280] truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <BarChart3 size={12} />
                    <span>{link.clicks || 0}</span>
                  </div>
                  <button onClick={() => handleOpenModal(link)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#2EE6A6]"><Edit size={14} /></button>
                  <button onClick={() => handleToggle(link._id, link.enabled)} className={`relative w-9 h-5 rounded-full transition-colors ${link.enabled ? 'bg-[#2EE6A6]' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${link.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <button onClick={() => handleDelete(link._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}

          {archivedLinks.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={14} className="text-[#6B7280]" />
                <span className="text-xs font-medium text-[#6B7280]">Archived ({archivedLinks.length})</span>
              </div>
              {archivedLinks.map((link) => (
                <div key={link._id} className="bg-gray-50 rounded-xl border border-gray-200 p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab text-gray-400"><GripVertical size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#111111] truncate">{link.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(link)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit size={14} /></button>
                      <button onClick={() => handleToggle(link._id, link.enabled)} className="relative w-9 h-5 bg-gray-300 rounded-full"><span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" /></button>
                      <button onClick={() => handleDelete(link._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#111111]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#111111]">{editingLink ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="My YouTube Channel" className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] ${errors.title ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">URL *</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://youtube.com/@channel" className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] ${errors.url ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.url && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.url}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Thumbnail (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; } const reader = new FileReader(); reader.onloadend = () => { setFormData({ ...formData, thumbnailUrl: reader.result as string }); }; reader.readAsDataURL(file); }} className="hidden" id="thumb-upload" />
                <label htmlFor="thumb-upload" className="cursor-pointer flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#2EE6A6] transition-colors">
                  {formData.thumbnailUrl ? <img src={formData.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon size={18} className="text-gray-400" /></div>}
                  <span className="text-xs text-[#6B7280]">Click to upload</span>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2"><Eye size={16} className="text-gray-600" /><span className="text-sm font-medium">{formData.enabled ? 'Visible' : 'Hidden'}</span></div>
                <button type="button" onClick={() => setFormData({ ...formData, enabled: !formData.enabled })} className={`relative w-10 h-5 rounded-full transition-colors ${formData.enabled ? 'bg-[#2EE6A6]' : 'bg-gray-300'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-100 text-[#111111] py-2.5 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#2EE6A6] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1FD695] disabled:opacity-50">
                  {loading ? 'Saving...' : editingLink ? 'Update' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}