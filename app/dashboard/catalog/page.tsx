'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMerchant } from '@/hooks/useMerchant';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products';
import { getCategories } from '@/services/categories';
import { uploadProductImage } from '@/services/storage';
import { Product, Category, ProductBadge } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/LoadingSpinner';
import { MultiImageUpload } from '@/components/ui/FileUpload';
import { formatCurrency } from '@/utils/currency';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  categoryId: z.string().min(1, 'Select a category'),
  description: z.string().min(5, 'Required'),
  price: z.coerce.number().min(1, 'Price must be > 0'),
  salePrice: z.coerce.number().min(0).optional(),
  quantityAvailable: z.coerce.number().min(0),
  badge: z.enum(['New', 'Best Seller', 'Sale', '']).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CatalogPage() {
  const { merchant } = useMerchant();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    if (merchant) loadData();
  }, [merchant]);

  async function loadData() {
    if (!merchant) return;
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(merchant.id),
        getCategories(merchant.id),
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setImageFiles([]);
    setImageUrls([]);
    reset({ name: '', categoryId: '', description: '', price: 0, salePrice: undefined, quantityAvailable: 0, badge: '' });
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setImageFiles([]);
    setImageUrls(p.images);
    setValue('name', p.name);
    setValue('categoryId', p.categoryId);
    setValue('description', p.description);
    setValue('price', p.price);
    setValue('salePrice', p.salePrice ?? undefined);
    setValue('quantityAvailable', p.quantityAvailable);
    setValue('badge', p.badge || '');
    setModalOpen(true);
  }

  function handleAddImage(file: File) {
    const url = URL.createObjectURL(file);
    setImageFiles((prev) => [...prev, file]);
    setImageUrls((prev) => [...prev, url]);
  }

  function handleRemoveImage(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(values: FormValues) {
    if (!merchant) return;
    setSaving(true);
    try {
      // Upload new images
      const existingUrls = editing
        ? editing.images.filter((url) => imageUrls.includes(url))
        : [];
      const newImages: string[] = [];

      for (const file of imageFiles) {
        const productId = editing?.id || 'new_' + Date.now();
        const url = await uploadProductImage(merchant.id, productId, file);
        newImages.push(url);
      }

      const allImages = [...existingUrls, ...newImages];
      const featuredImage = allImages[0] || '';

      const productData = {
        categoryId: values.categoryId,
        name: values.name,
        description: values.description,
        price: values.price,
        salePrice: values.salePrice && values.salePrice > 0 && values.salePrice < values.price
          ? values.salePrice
          : undefined,
        quantityAvailable: values.quantityAvailable,
        images: allImages,
        featuredImage,
        badge: (values.badge || null) as ProductBadge,
      };

      if (editing) {
        await updateProduct(editing.id, productData);
        toast.success('Product updated');
      } else {
        await createProduct({ merchantId: merchant.id, ...productData });
        toast.success('Product created');
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function toggleActive(p: Product) {
    try {
      await updateProduct(p.id, { active: !p.active });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x))
      );
    } catch {
      toast.error('Failed to update');
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const categoryOptions = [
    { value: '', label: 'Select category' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const badgeOptions = [
    { value: '', label: 'No badge' },
    { value: 'New', label: 'New' },
    { value: 'Best Seller', label: 'Best Seller' },
    { value: 'Sale', label: 'Sale' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 w-full max-w-5xl pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package size={24} />}
            title={search ? 'No matching products' : 'No products yet'}
            description={
              search
                ? 'Try a different search term'
                : 'Start building your catalog by adding your first product'
            }
            action={
              !search ? (
                <Button onClick={openCreate} size="sm">
                  <Plus size={16} />
                  Add product
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((p) => {
            const category = categories.find((c) => c.id === p.categoryId);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {p.featuredImage ? (
                    <Image
                      src={p.featuredImage}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={32} className="text-gray-300" />
                    </div>
                  )}
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  {!p.active && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 md:p-4">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                    {p.name}
                  </p>
                  {category && (
                    <p className="text-xs text-gray-400 mb-2 truncate">{category.name}</p>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    {p.salePrice && p.salePrice < p.price ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(p.salePrice)}</p>
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(p.price)}</p>
                    )}
                    <span className="text-xs text-gray-500 shrink-0">
                      {p.quantityAvailable} left
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-3 pb-3 md:px-4 md:pb-4 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleActive(p)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {p.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    {p.active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit product' : 'Add product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Product name *"
                placeholder="e.g. Floral Midi Dress"
                error={errors.name?.message}
                className="col-span-2"
                {...register('name')}
              />
              <Select
                label="Category *"
                options={categoryOptions}
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />
              <Select
                label="Badge"
                options={badgeOptions}
                {...register('badge')}
              />
            </div>
            <Textarea
              label="Description *"
              placeholder="Describe your product..."
              error={errors.description?.message}
              rows={3}
              {...register('description')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹) *"
                type="number"
                min={0}
                step={0.01}
                error={errors.price?.message}
                {...register('price')}
              />
              <Input
                label="Sale price (₹)"
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
                error={errors.salePrice?.message}
                {...register('salePrice')}
              />
            </div>
            <Input
              label="Quantity available *"
              type="number"
              min={0}
              error={errors.quantityAvailable?.message}
              {...register('quantityAvailable')}
            />
            <MultiImageUpload
              label="Product images (first = cover)"
              images={imageUrls}
              onAdd={handleAddImage}
              onRemove={handleRemoveImage}
            />
          </div>
          <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {editing ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
