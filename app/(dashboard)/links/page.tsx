'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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

  const links = linksData || [];

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
    setFormData({ title: '', url: '', description: '', thumbnailUrl: '', enabled: true });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL (including https://)';
      }
    }

    if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
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
          linkId: editingLink._id as Id<"links">,
          title: formData.title,
          url: formData.url,
          description: formData.description || undefined,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          enabled: formData.enabled,
        });
      } else {
        await createLinkMutation({
          userId: profile._id as Id<"links">,
          title: formData.title,
          url: formData.url,
          description: formData.description || undefined,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          enabled: formData.enabled,
        });
      }

      handleCloseModal();
    } catch (error: any) {
      alert(error.message || 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (linkId: string, currentEnabled: boolean) => {
    try {
      await toggleLinkMutation({
        linkId: linkId as any,
        enabled: !currentEnabled,
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await deleteLinkMutation({ linkId: linkId as any });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverItem) {
      setDragOverItem(id);
    }
  };

  const handleDragLeave = () => {
    // Optional: add visual feedback
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || !targetId || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const currentLinks = [...links].sort((a, b) => a.orderIndex - b.orderIndex);
    const draggedIndex = currentLinks.findIndex((l) => l._id === draggedItem);
    const targetIndex = currentLinks.findIndex((l) => l._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentLinks];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    try {
      await reorderLinksMutation({
        userId: profile?._id || '',
        linkIds: newOrder.map((l) => l._id as any),
      });
    } catch (error) {
      console.error('Failed to reorder links:', error);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const activeLinks = links.filter((l) => l.enabled).sort((a, b) => a.orderIndex - b.orderIndex);
  const archivedLinks = links.filter((l) => !l.enabled).sort((a, b) => a.orderIndex - b.orderIndex);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-center gap-4">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || profile.username}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#2EE6A6] shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-[#2EE6A6] to-[#2EE6A6]/70 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile?.displayName?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#111111]">@{profile?.username}</h2>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => handleOpenModal()}
        disabled={links.length >= 5}
        className={`w-full py-4 rounded-full font-semibold text-lg mb-6 transition-all flex items-center justify-center gap-2 ${
          links.length >= 5
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695] shadow-lg shadow-[#2EE6A6]/20'
        }`}
        title={links.length >= 5 ? 'Maximum 5 links reached' : 'Add new link'}
      >
        <Plus size={24} />
        {links.length >= 5 ? 'Maximum Links Reached (5/5)' : 'Add New Link'}
      </button>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="w-16 h-16 bg-[#2EE6A6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="text-[#2EE6A6]" size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-[#111111] mb-2">No links yet</h3>
            <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
              Add your first link to start building your earning bio page!
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-[#2EE6A6] text-white px-8 py-3 rounded-xl hover:bg-[#1FD695] transition-all inline-flex items-center gap-2 font-semibold shadow-lg"
            >
              <Plus size={20} />
              Add Your First Link
            </button>
          </div>
        ) : (
          <>
            {activeLinks.map((link) => (
              <div
                key={link._id}
                draggable
                onDragStart={(e) => handleDragStart(e, link._id)}
                onDragOver={(e) => handleDragOver(e, link._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, link._id)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
                  draggedItem === link._id
                    ? 'opacity-50 border-[#2EE6A6]'
                    : dragOverItem === link._id
                    ? 'border-[#2EE6A6] border-2'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex overflow-hidden">
                  <div className="flex items-center justify-center px-4 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors">
                    <GripVertical size={20} className="text-gray-400" />
                  </div>

                  <div className="flex-1 py-5 pr-5 min-w-0">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#111111] text-sm">{link.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 truncate max-w-full block">{link.url}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex items-center gap-1 text-xs">
                          <BarChart3 size={16} />
                          <span>{link.clicks || 0} clicks</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleOpenModal(link)}
                          className="text-gray-500 hover:text-[#2EE6A6] transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleToggle(link._id, link.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            link.enabled ? 'bg-[#2EE6A6]' : 'bg-gray-300'
                          }`}
                          title={link.enabled ? 'Active' : 'Inactive'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              link.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => handleDelete(link._id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {link.thumbnailUrl && (
                    <div className="w-20 h-20 my-5 mr-5 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={link.thumbnailUrl} alt={link.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {archivedLinks.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <EyeOff size={18} className="text-[#6B7280]" />
                  <h2 className="text-lg font-display font-bold text-[#111111]">
                    Archived Links ({archivedLinks.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {archivedLinks.map((link) => (
                    <div
                      key={link._id}
                      className="bg-gray-50 rounded-2xl border border-gray-200 flex overflow-hidden opacity-60"
                    >
                      <div className="flex items-center justify-center px-4">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1 py-5">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[#111111] text-sm">{link.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 truncate">{link.url}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center gap-1 text-xs">
                              <BarChart3 size={16} />
                              <span>{link.clicks || 0} clicks</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => handleOpenModal(link)} className="text-gray-500 hover:text-[#2EE6A6] transition-colors">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleToggle(link._id, link.enabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                link.enabled ? 'bg-[#2EE6A6]' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  link.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <button onClick={() => handleDelete(link._id)} className="text-gray-500 hover:text-red-500">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {link.thumbnailUrl && (
                        <div className="w-20 h-20 my-5 mr-5 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={link.thumbnailUrl} alt={link.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#111111]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-[#111111]">
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} className="text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">
                    Link Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., My YouTube Channel"
                    className={`w-full border-2 ${errors.title ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className={`w-full border-2 ${errors.url ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all`}
                  />
                  {errors.url && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.url}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-3">
                    Thumbnail Image <span className="text-[#6B7280] font-normal">(Optional)</span>
                  </label>
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Image size should be less than 2MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, thumbnailUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer group relative">
                      {formData.thumbnailUrl ? (
                        <div className="relative">
                          <div className="w-32 h-32 rounded-xl border-2 border-[#2EE6A6] overflow-hidden bg-gray-50 group-hover:opacity-75 transition-opacity">
                            <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 rounded-full p-3">
                              <ImageIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[#2EE6A6] transition-colors">
                          <ImageIcon className="h-12 w-12 text-gray-400 group-hover:text-[#2EE6A6] transition-colors" />
                        </div>
                      )}
                    </label>
                    <p className="mt-3 text-sm text-[#6B7280] text-center">Click to upload thumbnail<br/>Max 2MB</p>
                  </div>
                </div>

                <div className="bg-[#FFFDF9] border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="text-[#111111]" size={20} />
                      <div>
                        <h4 className="font-semibold text-[#111111]">Link Visibility</h4>
                        <p className="text-sm text-[#6B7280]">
                          {formData.enabled ? 'Link is visible on your bio page' : 'Link is hidden from bio page'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        formData.enabled ? 'bg-[#2EE6A6]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          formData.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 text-[#111111] px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#2EE6A6] text-white px-6 py-3 rounded-xl hover:bg-[#1FD695] transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingLink ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}