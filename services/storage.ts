async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Image upload failed');

  const data = await res.json();
  return data.url as string;
}

export async function uploadMerchantLogo(_merchantId: string, file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadMerchantBanner(_merchantId: string, file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadProductImage(_merchantId: string, _productId: string, file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadCategoryImage(_merchantId: string, file: File): Promise<string> {
  return uploadImage(file);
}
