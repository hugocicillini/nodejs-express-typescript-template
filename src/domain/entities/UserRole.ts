export interface UserRoleProps {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export class UserRole {
  private constructor(private props: UserRoleProps) {}

  static create(props: UserRoleProps): UserRole {
    return new UserRole(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get roleId(): string {
    return this.props.roleId;
  }

  get assignedAt(): Date {
    return this.props.assignedAt;
  }

  get assignedBy(): string | null {
    return this.props.assignedBy;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return this.props.expiresAt < new Date();
  }

  toJSON(): UserRoleProps {
    return { ...this.props };
  }
}
