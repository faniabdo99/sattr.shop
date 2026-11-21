import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import {
    controlClass,
    Field,
    FieldError,
    Panel,
} from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors } from '@/types/admin';

/** Plain text settings; names match SettingsRequest exactly. */
const textFields = [
    'instapay_ipa',
    'instapay_phone',
    'contact_whatsapp',
    'contact_email',
    'social_instagram',
    'social_facebook',
    'social_tiktok',
    'tracking_ga4_id',
    'tracking_ga4_api_secret',
    'tracking_meta_pixel_id',
    'tracking_meta_capi_token',
    'tracking_posthog_key',
    'tracking_posthog_host',
    'tracking_tiktok_pixel_id',
    'tracking_tiktok_access_token',
    'notifications_admin_email',
    'notifications_telegram_bot_token',
    'notifications_telegram_chat_id',
] as const;

type TextField = (typeof textFields)[number];

type SettingsForm = Record<TextField, string> & {
    seo_default_title: Bilingual;
    seo_default_description: Bilingual;
    instapay_qr: File | null;
    seo_og_image: File | null;
};

type Props = {
    values: Partial<Record<TextField, string | null>> & {
        seo_default_title?: unknown;
        seo_default_description?: unknown;
    };
    secrets_set: Partial<Record<TextField, boolean>>;
    files: { instapay_qr: string | null; seo_og_image: string | null };
    server_drivers: string[];
    update_url: string;
};

const inputClass = cn(controlClass, 'h-9 py-1');

type TextInputProps = {
    name: TextField;
    label: string;
    type?: 'text' | 'email' | 'url' | 'tel';
    placeholder?: string;
    hint?: string;
    mono?: boolean;
};

export default function Settings({
    values,
    secrets_set,
    files,
    server_drivers,
    update_url,
}: Props) {
    const form = useForm<SettingsForm>({
        ...(Object.fromEntries(
            textFields.map((name) => [name, values[name] ?? '']),
        ) as Record<TextField, string>),
        seo_default_title: bi(values.seo_default_title),
        seo_default_description: bi(values.seo_default_description),
        instapay_qr: null,
        seo_og_image: null,
    });
    const errors = form.errors as FormErrors;
    // Bumped after a save so the file inputs remount empty.
    const [fileKey, setFileKey] = useState(0);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(update_url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Secrets and files are write-only: clear them once saved.
                form.setData((data) => ({
                    ...data,
                    ...Object.fromEntries(
                        Object.keys(secrets_set).map((name) => [name, '']),
                    ),
                    instapay_qr: null,
                    seo_og_image: null,
                }));
                setFileKey((key) => key + 1);
            },
        });
    };

    const text = ({
        name,
        label,
        type = 'text',
        placeholder,
        hint,
        mono = false,
    }: TextInputProps) => {
        const isSecret = name in secrets_set;
        const saved = secrets_set[name] === true;

        return (
            <Field
                key={name}
                id={name}
                label={label}
                error={errors[name]}
                hint={
                    isSecret
                        ? `${hint ? `${hint} ` : ''}Secret: never shown again after saving.`
                        : hint
                }
            >
                <input
                    id={name}
                    name={name}
                    type={isSecret ? 'password' : type}
                    dir="ltr"
                    autoComplete={isSecret ? 'new-password' : 'off'}
                    spellCheck={false}
                    placeholder={
                        isSecret
                            ? saved
                                ? 'Saved, leave blank to keep'
                                : 'Not set'
                            : placeholder
                    }
                    value={form.data[name]}
                    onChange={(event) => form.setData(name, event.target.value)}
                    className={cn(inputClass, mono && 'font-mono text-xs')}
                />
            </Field>
        );
    };

    const fileField = (
        name: 'instapay_qr' | 'seo_og_image',
        label: string,
        current: string | null,
        hint: string,
    ) => (
        <div className="grid gap-1.5">
            <label htmlFor={name} className="text-sm leading-none font-medium">
                {label}
            </label>
            <div className="flex flex-wrap items-start gap-4">
                {current ? (
                    <a
                        href={current}
                        target="_blank"
                        rel="noreferrer"
                        className="block shrink-0 overflow-hidden rounded-sm border border-border bg-paper"
                    >
                        <img
                            src={current}
                            alt={`Current ${label.toLowerCase()}`}
                            className="h-28 w-auto max-w-56 object-contain"
                        />
                    </a>
                ) : (
                    <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-xs text-muted-foreground">
                        None yet
                    </span>
                )}
                <div className="grid gap-1.5">
                    <input
                        key={fileKey}
                        id={name}
                        name={name}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            form.setData(name, event.target.files?.[0] ?? null)
                        }
                        className="text-xs file:mr-3 file:h-8 file:rounded-md file:border file:border-solid file:border-input file:bg-card file:px-3 file:text-xs file:font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                        {hint}
                        {current &&
                            ' Choosing a file replaces the current one.'}
                    </p>
                    <FieldError message={errors[name]} />
                </div>
            </div>
        </div>
    );

    return (
        <div className={pageClass}>
            <Head title="Settings" />
            <PageHeader
                title="Settings"
                description="Payment details, contact links, tracking, default SEO and notifications."
                actions={
                    <Button
                        type="submit"
                        form="settings-form"
                        disabled={form.processing}
                    >
                        Save settings
                    </Button>
                }
            />

            <form id="settings-form" onSubmit={submit} className="space-y-6">
                <Panel
                    title="InstaPay"
                    description="Shown to customers who choose to pay by InstaPay."
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        {text({
                            name: 'instapay_ipa',
                            label: 'InstaPay address (IPA)',
                            placeholder: 'name@instapay',
                        })}
                        {text({
                            name: 'instapay_phone',
                            label: 'InstaPay phone',
                            type: 'tel',
                            placeholder: '01XXXXXXXXX',
                            hint: 'An Egyptian mobile number.',
                        })}
                    </div>
                    {fileField(
                        'instapay_qr',
                        'InstaPay QR code',
                        files.instapay_qr,
                        'An image up to 2 MB.',
                    )}
                </Panel>

                <Panel title="Contact & social">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {text({
                            name: 'contact_whatsapp',
                            label: 'WhatsApp number',
                            type: 'tel',
                            placeholder: '+201XXXXXXXXX',
                            hint: 'Digits only, with country code.',
                        })}
                        {text({
                            name: 'contact_email',
                            label: 'Contact email',
                            type: 'email',
                        })}
                        {text({
                            name: 'social_instagram',
                            label: 'Instagram URL',
                            type: 'url',
                            placeholder: 'https://instagram.com/…',
                        })}
                        {text({
                            name: 'social_facebook',
                            label: 'Facebook URL',
                            type: 'url',
                            placeholder: 'https://facebook.com/…',
                        })}
                        {text({
                            name: 'social_tiktok',
                            label: 'TikTok URL',
                            type: 'url',
                            placeholder: 'https://tiktok.com/@…',
                        })}
                    </div>
                </Panel>

                <Panel
                    title="Tracking"
                    description="A provider turns on only when its ID is filled in; clear the ID to turn it off."
                >
                    <p className="text-sm">
                        <span className="text-muted-foreground">
                            Server-side drivers active now:{' '}
                        </span>
                        {server_drivers.length > 0 ? (
                            <span className="font-medium">
                                {server_drivers.join(', ')}
                            </span>
                        ) : (
                            <span className="font-medium">none</span>
                        )}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {text({
                            name: 'tracking_ga4_id',
                            label: 'GA4 measurement ID',
                            placeholder: 'G-XXXXXXXXXX',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_ga4_api_secret',
                            label: 'GA4 API secret',
                            hint: 'For server-side purchase events.',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_meta_pixel_id',
                            label: 'Meta Pixel ID',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_meta_capi_token',
                            label: 'Meta Conversions API token',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_posthog_key',
                            label: 'PostHog project key',
                            placeholder: 'phc_…',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_posthog_host',
                            label: 'PostHog host',
                            type: 'url',
                            placeholder: 'https://eu.i.posthog.com',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_tiktok_pixel_id',
                            label: 'TikTok Pixel ID',
                            mono: true,
                        })}
                        {text({
                            name: 'tracking_tiktok_access_token',
                            label: 'TikTok Events API access token',
                            mono: true,
                        })}
                    </div>
                </Panel>

                <Panel
                    title="Default SEO"
                    description="Used on pages that do not set their own title, description or share image."
                >
                    <BilingualField
                        label="Default title"
                        name="seo_default_title"
                        value={form.data.seo_default_title}
                        onChange={(value) =>
                            form.setData('seo_default_title', value)
                        }
                        errors={errors}
                        max={70}
                    />
                    <BilingualField
                        label="Default description"
                        name="seo_default_description"
                        value={form.data.seo_default_description}
                        onChange={(value) =>
                            form.setData('seo_default_description', value)
                        }
                        errors={errors}
                        multiline
                        rows={3}
                        max={170}
                    />
                    {fileField(
                        'seo_og_image',
                        'Default social share image',
                        files.seo_og_image,
                        'An image up to 4 MB, ideally 1200 × 630.',
                    )}
                </Panel>

                <Panel
                    title="Notifications"
                    description="Where new-order and payment alerts are sent."
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        {text({
                            name: 'notifications_admin_email',
                            label: 'Admin email',
                            type: 'email',
                        })}
                        {text({
                            name: 'notifications_telegram_chat_id',
                            label: 'Telegram chat ID',
                            mono: true,
                        })}
                        {text({
                            name: 'notifications_telegram_bot_token',
                            label: 'Telegram bot token',
                            mono: true,
                        })}
                    </div>
                </Panel>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Save settings
                    </Button>
                </div>
            </form>
        </div>
    );
}
