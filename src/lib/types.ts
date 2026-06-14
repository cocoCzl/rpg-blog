export interface Comment {
  id: number
  article_slug: string
  author_name: string
  author_avatar: string
  body: string
  created_at: string
  approved: number
}

export interface CommentDisplay {
  id: number
  author_name: string
  author_avatar: string
  body: string
  created_at: string
}
