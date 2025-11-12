export interface RefreshTokenProps {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static create(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  get id(): string {
    return this.props.id;
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  revoke(): void {
    this.props.deletedAt = new Date();
  }

  toJSON(): RefreshTokenProps {
    return { ...this.props };
  }
}
