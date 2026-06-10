"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ImageIcon,
} from "lucide-react"

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  function addLink() {
    const url = window.prompt("输入链接地址:")
    if (url) {
      editor!.chain().focus().setLink({ href: url }).run()
    }
  }

  function addImage() {
    const url = window.prompt("输入图片地址:")
    if (url) {
      editor!.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 border-b p-1.5 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        >
          <Heading3 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-muted" : ""}
        >
          <LinkIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={addImage}
        >
          <ImageIcon />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[300px] p-4 prose prose-sm max-w-none focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px] [&_img]:max-w-full [&_img]:rounded"
      />
    </div>
  )
}
