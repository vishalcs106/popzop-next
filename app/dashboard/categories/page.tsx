'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMerchant } from '@/hooks/useMerchant';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories';
import { uploadCategoryImage } from '@/services/storage';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { FileUpload } from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(50),
});
type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { merchant } = useMerchant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (merchant) loadCategories();
  }, [merchant]);

  async function loadCategories() {
    if (!merchant) return;
    setLoading(true);
    try {
      const cats = await getCategories(merchant.id);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingCategory(null);
    setImageFile(null);
    reset({ name: '' });
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setImageFile(null);
    setValue('name', cat.name);
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (!merchant) return;
    setSaving(true);
    try {
      let imageUrl = editingCategory?.imageUrl || '';
      if (imageFile) {
        imageUrl = await uploadCategoryImage(merchant.id, imageFile);
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: values.name,
          imageUrl,
        });
        toast.success('Category updated');
      } else {
        await createCategory({
          merchantId: merchant.id,
          name: values.name,
          imageUrl,
          sortOrder: categories.length,
        });
        toast.success('Category created');
      }
      setModalOpen(false);
      loadCategories();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Products in this category won't be deleted.`)) return;
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await updateCategory(cat.id, { active: !cat.active });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
    } catch {
      toast.error('Failed to update');
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 w-full max-w-3xl pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Organize your products into categories
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Tag size={24} />}
            title="No categories yet"
            description="Categories help customers browse your products easily"
            action={
              <Button onClick={openCreate} size="sm">
                <Plus size={16} />
                Add your first category
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 md:p-4 hover:border-gray-200 transition-colors"
            >
              {/* Image */}
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag size={17} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                  <Badge variant={cat.active ? 'success' : 'default'}>
                    {cat.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sort order: {cat.sortOrder}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => toggleActive(cat)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title={cat.active ? 'Deactivate' : 'Activate'}
                >
                  {cat.active ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === cat.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit category' : 'New category'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 md:p-6 space-y-4">
            <Input
              label="Category name *"
              placeholder="e.g. Tops, Dresses, Accessories"
              error={errors.name?.message}
              {...register('name')}
            />
            <FileUpload
              label="Category image (optional)"
              aspectRatio="wide"
              hint="Recommended: 16:9"
              value={editingCategory?.imageUrl}
              onChange={setImageFile}
            />
          </div>
          <div className="px-4 md:px-6 pb-4 md:pb-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editingCategory ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
