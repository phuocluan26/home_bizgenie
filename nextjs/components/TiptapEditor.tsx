'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  // Cập nhật nội dung editor khi prop content thay đổi
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-700 rounded-lg bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2 flex flex-wrap gap-2">
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('strike')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Blockquote"
        >
          "
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('code')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Inline Code"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-[#F66F00] text-[#060909]'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Code Block"
        >
          {'{ }'}
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* Editor content */}
      <div className="focus-within:ring-2 focus-within:ring-[#F66F00] rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
