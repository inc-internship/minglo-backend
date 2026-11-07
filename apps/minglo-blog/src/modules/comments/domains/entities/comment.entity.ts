interface CreateCommentDto {
  postId: number;
  authorId: number;
  text: string;
  parentCommentId?: number;
}

export class CommentEntity {
  private id: number | null = null;
  private publicId: string | null = null;
  private postId: number;
  private authorId: number;
  private parentCommentId: number | null;
  private text: string;

  private constructor(dto: CreateCommentDto) {
    this.postId = dto.postId;
    this.authorId = dto.authorId;
    this.text = dto.text;
    this.parentCommentId = dto.parentCommentId ?? null;
  }

  static create(dto: CreateCommentDto): CommentEntity {
    return new CommentEntity(dto);
  }

  getPostId(): number {
    return this.postId;
  }

  getAuthorId(): number {
    return this.authorId;
  }

  getText(): string {
    return this.text;
  }

  getParentCommentId(): number | null {
    return this.parentCommentId;
  }
}