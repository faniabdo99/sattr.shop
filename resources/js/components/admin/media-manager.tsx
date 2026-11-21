import { router, useForm } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import type { FormEvent } from 'react';
import { useId, useRef } from 'react';
import { controlClass, FieldError, Panel } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MediaItem, MediaModel } from '@/types/admin';

type Props = {
    model: MediaModel;
    id: number;
    collection: string;
    items: MediaItem[];
    title: string;
    hint?: string;
    single?: boolean;
};

const inputClass = cn(controlClass, 'h-8 py-1 text-xs');

function MediaRow({ item }: { item: MediaItem }) {
    const id = useId();
    const form = useForm({
        alt_ar: item.alt?.ar ?? '',
        alt_en: item.alt?.en ?? '',
    });

    const save = (event: FormEvent) => {
        event.preventDefault();
        form.put(`/admin/media/${item.id}`, { preserveScroll: true });
    };

    const remove = () => {
        if (window.confirm('Remove this image? This cannot be undone.')) {
            router.delete(`/admin/media/${item.id}`, { preserveScroll: true });
        }
    };

    return (
        <li className="flex flex-wrap gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
            <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block size-20 shrink-0 overflow-hidden rounded-sm border border-border bg-paper"
            >
                <img
                    src={item.thumb}
                    alt={item.alt?.en || item.alt?.ar || ''}
                    loading="lazy"
                    className="size-full object-cover"
                />
            </a>
            <form
                onSubmit={save}
                className="grid min-w-0 flex-1 basis-64 gap-2 sm:grid-cols-2"
            >
                <div className="grid gap-1">
                    <label
                        htmlFor={`${id}-ar`}
                        className="text-xs text-muted-foreground"
                    >
                        Alt text (Arabic)
                    </label>
                    <input
                        id={`${id}-ar`}
                        dir="rtl"
                        lang="ar"
                        required
                        maxLength={200}
                        value={form.data.alt_ar}
                        onChange={(event) =>
                            form.setData('alt_ar', event.target.value)
                        }
                        className={inputClass}
                    />
                    <FieldError message={form.errors.alt_ar} />
                </div>
                <div className="grid gap-1">
                    <label
                        htmlFor={`${id}-en`}
                        className="text-xs text-muted-foreground"
                    >
                        Alt text (English)
                    </label>
                    <input
                        id={`${id}-en`}
                        dir="ltr"
                        required
                        maxLength={200}
                        value={form.data.alt_en}
                        onChange={(event) =>
                            form.setData('alt_en', event.target.value)
                        }
                        className={inputClass}
                    />
                    <FieldError message={form.errors.alt_en} />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                    <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={form.processing || !form.isDirty}
                    >
                        Save alt text
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:text-danger"
                        onClick={remove}
                    >
                        <Trash2 aria-hidden />
                        Remove
                    </Button>
                </div>
            </form>
        </li>
    );
}

export function MediaManager({
    model,
    id,
    collection,
    items,
    title,
    hint,
    single = false,
}: Props) {
    const fieldId = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const form = useForm<{
        model: MediaModel;
        id: number;
        collection: string;
        file: File | null;
        alt_ar: string;
        alt_en: string;
    }>({ model, id, collection, file: null, alt_ar: '', alt_en: '' });

    const upload = (event: FormEvent) => {
        event.preventDefault();
        form.post('/admin/media', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('file', 'alt_ar', 'alt_en');

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    const replaces = single && items.length > 0;
    const percent = form.progress?.percentage;

    return (
        <Panel
            title={title}
            description={
                hint ??
                (single
                    ? 'One image.'
                    : 'Any number of images, in upload order.')
            }
        >
            {items.length > 0 ? (
                <ul>
                    {items.map((item) => (
                        <MediaRow key={item.id} item={item} />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No image yet.</p>
            )}

            <form
                onSubmit={upload}
                className="grid gap-3 rounded-sm bg-paper/60 p-3 sm:grid-cols-2"
            >
                <div className="grid gap-1 sm:col-span-2">
                    <label
                        htmlFor={`${fieldId}-file`}
                        className="text-xs font-medium"
                    >
                        {replaces ? 'Replace image' : 'Upload image'}
                    </label>
                    <input
                        ref={fileInput}
                        id={`${fieldId}-file`}
                        type="file"
                        required
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) =>
                            form.setData(
                                'file',
                                event.target.files?.[0] ?? null,
                            )
                        }
                        className="text-xs file:mr-3 file:h-8 file:rounded-md file:border file:border-solid file:border-input file:bg-card file:px-3 file:text-xs file:font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP or AVIF, up to 8 MB.
                        {replaces && ' Uploading replaces the current image.'}
                    </p>
                    <FieldError message={form.errors.file} />
                </div>
                <div className="grid gap-1">
                    <label
                        htmlFor={`${fieldId}-ar`}
                        className="text-xs text-muted-foreground"
                    >
                        Alt text (Arabic) <span className="text-danger">*</span>
                    </label>
                    <input
                        id={`${fieldId}-ar`}
                        dir="rtl"
                        lang="ar"
                        required
                        maxLength={200}
                        value={form.data.alt_ar}
                        onChange={(event) =>
                            form.setData('alt_ar', event.target.value)
                        }
                        className={cn(inputClass, 'bg-card')}
                    />
                    <FieldError message={form.errors.alt_ar} />
                </div>
                <div className="grid gap-1">
                    <label
                        htmlFor={`${fieldId}-en`}
                        className="text-xs text-muted-foreground"
                    >
                        Alt text (English){' '}
                        <span className="text-danger">*</span>
                    </label>
                    <input
                        id={`${fieldId}-en`}
                        dir="ltr"
                        required
                        maxLength={200}
                        value={form.data.alt_en}
                        onChange={(event) =>
                            form.setData('alt_en', event.target.value)
                        }
                        className={cn(inputClass, 'bg-card')}
                    />
                    <FieldError message={form.errors.alt_en} />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={form.processing}>
                        <Upload aria-hidden />
                        {form.processing ? 'Uploading…' : 'Upload'}
                    </Button>
                    {form.processing && percent !== undefined && (
                        <div className="flex flex-1 items-center gap-2">
                            <progress
                                value={percent}
                                max={100}
                                aria-label="Upload progress"
                                className="h-1 flex-1 accent-line"
                            />
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {Math.round(percent)}%
                            </span>
                        </div>
                    )}
                    <FieldError
                        message={
                            form.errors.collection ??
                            form.errors.model ??
                            form.errors.id
                        }
                    />
                </div>
            </form>
        </Panel>
    );
}
