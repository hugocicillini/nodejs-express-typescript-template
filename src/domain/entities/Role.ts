import { RoleName } from "@/domain/value-objects/RoleName";

export interface RoleProps {
  id: string;
  name: RoleName;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Role {
  private constructor(private props: RoleProps) {}

  static create(props: RoleProps): Role {
    return new Role(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): RoleName {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
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

  deactivate(): void {
    this.props.isActive = false;
    this.props.deletedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.deletedAt = null;
    this.props.updatedAt = new Date();
  }

  updateName(name: RoleName): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  toJSON(): RoleProps {
    return { ...this.props };
  }
}
