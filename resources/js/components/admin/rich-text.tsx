import Image from '@tiptap/extension-image';
import type { Editor } from '@tiptap/react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { LucideIcon } from 'lucide-react';
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Undo2,
} from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { controlClass, FieldError } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadTarget = {
    url: string;
    model: string;
    id: number;
    locale: 'ar' | 'en';
};

type Props = {
    value: string;
    onChange: (html: string) => void;
    dir: 'rtl' | 'ltr';
    upload?: UploadTarget;
    /** Accessible name for the editing area. */
    label?: string;
};

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

function ToolButton({
    icon: Icon,
    label,
    active = false,
    disabled = false,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            // Keep the text selection while clicking a toolbar button.
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                'inline-flex size-8 items-center justify-center rounded-sm text-ink-muted hover:bg-accent hover:text-ink disabled:pointer-events-none disabled:opacity-40',
                active &&
                    'bg-line/10 text-line hover:bg-line/15 hover:text-line',
            )}
        >
            <Icon className="size-4" aria-hidden />
        </button>
    );
}

function Toolbar({
    editor,
    onPickImage,
}: {
    editor: Editor;
    onPickImage?: () => void;
}) {
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            h2: current.isActive('heading', { level: 2 }),
            h3: current.isActive('heading', { level: 3 }),
            bullet: current.isActive('bulletList'),
            ordered: current.isActive('orderedList'),
            quote: current.isActive('blockquote'),
            link: current.isActive('link'),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
        }),
    });

    const setLink = () => {
        const previous = editor.getAttributes('link').href as
            | string
            | undefined;
        const url = window.prompt(
            'Link URL (leave empty to remove the link)',
            previous ?? 'https://',
        );

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url.trim() })
            .run();
    };

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            dir="ltr"
            className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1"
        >
            <ToolButton
                icon={Bold}
                label="Bold"
                active={state.bold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolButton
                icon={Italic}
                label="Italic"
                active={state.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ToolButton
                icon={Heading2}
                label="Heading 2"
                active={state.h2}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            />
            <ToolButton
                icon={Heading3}
                label="Heading 3"
                active={state.h3}
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
            />
            <ToolButton
                icon={List}
                label="Bullet list"
                active={state.bullet}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolButton
                icon={ListOrdered}
                label="Numbered list"
                active={state.ordered}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolButton
                icon={Quote}
                label="Quote"
                active={state.quote}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <ToolButton
                icon={Link2}
                label="Link"
                active={state.link}
                onClick={setLink}
            />
            {onPickImage && (
                <ToolButton
                    icon={ImagePlus}
                    label="Insert image"
                    onClick={onPickImage}
                />
            )}
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ToolButton
                icon={Undo2}
                label="Undo"
                disabled={!state.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
            />
            <ToolButton
                icon={Redo2}
                label="Redo"
                disabled={!state.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
            />
        </div>
    );
}

export function RichText({ value, onChange, dir, upload, label }: Props) {
    const id = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const latestOnChange = useRef(onChange);
    const [file, setFile] = useState<File | null>(null);
    const [alt, setAlt] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    useEffect(() => {
        latestOnChange.current = onChange;
    }, [onChange]);

    const editor = useEditor({
        // Rendering waits for the client so server rendering never touches the DOM.
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: { openOnClick: false, autolink: true },
            }),
            Image,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose-sattr min-h-64 max-w-none px-4 py-3 outline-none',
                dir,
                lang: dir === 'rtl' ? 'ar' : 'en',
                role: 'textbox',
                'aria-multiline': 'true',
                ...(label ? { 'aria-label': label } : {}),
            },
        },
        onUpdate: ({ editor: current }) => {
            latestOnChange.current(current.isEmpty ? '' : current.getHTML());
        },
    });

    const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files?.[0] ?? null);
        setAlt('');
        setUploadError(undefined);
        event.target.value = '';
    };

    const cancelImage = () => {
        setFile(null);
        setAlt('');
        setUploadError(undefined);
    };

    const insertImage = async () => {
        if (!editor || !upload || !file) {
            return;
        }

        if (alt.trim() === '') {
            setUploadError('Alt text is required.');

            return;
        }

        const body = new FormData();
        body.append('model', upload.model);
        body.append('id', String(upload.id));
        body.append('collection', 'content');
        body.append('file', file);
        body.append('alt_ar', alt.trim());
        body.append('alt_en', alt.trim());
        body.append('locale', upload.locale);

        setUploading(true);
        setUploadError(undefined);

        try {
            const response = await fetch(upload.url, {
                method: 'POST',
                body,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
            });

            if (!response.ok) {
                const problem = (await response.json().catch(() => null)) as {
                    message?: string;
                    errors?: Record<string, string[]>;
                } | null;
                const first = problem?.errors
                    ? Object.values(problem.errors)[0]?.[0]
                    : undefined;

                setUploadError(
                    first ??
                        problem?.message ??
                        `Upload failed (${response.status}).`,
                );

                return;
            }

            const image = (await response.json()) as {
                url: string;
                alt: string;
            };

            editor
                .chain()
                .focus()
                .setImage({ src: image.url, alt: image.alt })
                .run();
            cancelImage();
        } catch {
            setUploadError('Upload failed. Check your connection and retry.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            {editor ? (
                <Toolbar
                    editor={editor}
                    onPickImage={
                        upload ? () => fileInput.current?.click() : undefined
                    }
                />
            ) : (
                <div className="h-[41px] border-b border-border" />
            )}

            {upload && (
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="Choose an image to insert"
                    onChange={pickFile}
                />
            )}

            {upload && file && (
                <div
                    dir="ltr"
                    className="grid gap-2 border-b border-border bg-paper/60 px-3 py-2"
                >
                    <label
                        htmlFor={`${id}-alt`}
                        className="text-xs font-medium"
                    >
                        Alt text for{' '}
                        <span className="font-normal text-muted-foreground">
                            {file.name}
                        </span>{' '}
                        <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            id={`${id}-alt`}
                            dir={dir}
                            value={alt}
                            maxLength={200}
                            autoFocus
                            placeholder="Describe the image"
                            onChange={(event) => setAlt(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void insertImage();
                                }
                            }}
                            className={cn(
                                controlClass,
                                'h-8 min-w-48 flex-1 bg-card py-1 text-xs',
                            )}
                        />
                        <Button
                            type="button"
                            size="sm"
                            disabled={uploading}
                            onClick={() => void insertImage()}
                        >
                            {uploading ? 'Uploading…' : 'Insert image'}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={uploading}
                            onClick={cancelImage}
                        >
                            Cancel
                        </Button>
                    </div>
                    <FieldError message={uploadError} />
                </div>
            )}

            {editor ? (
                <EditorContent editor={editor} />
            ) : (
                <div className="min-h-64" />
            )}
        </div>
    );
}
