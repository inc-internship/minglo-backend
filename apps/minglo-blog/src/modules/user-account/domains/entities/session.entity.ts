export class SessionEntity {
  public id: number;

  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
    public readonly deviceName: string,
    public readonly browserName: string,
    public readonly browserVersion: string,
    public readonly osName: string,
    public readonly ip: string,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public lastActive: Date,
  ) {}

  static create(args: {
    userId: number;
    deviceId: string;
    deviceName: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    ip: string;
    lastActive: Date;
    issuedAt: Date;
    expiresAt: Date;
  }): SessionEntity {
    return new SessionEntity(
      args.userId,
      args.deviceId,
      args.deviceName,
      args.browserName,
      args.browserVersion,
      args.osName,
      args.ip,
      args.issuedAt,
      args.expiresAt,
      args.lastActive,
    );
  }

  static reconstitute(args: {
    id: number;
    userId: number;
    deviceId: string;
    deviceName: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    ip: string;
    lastActive: Date;
    issuedAt: Date;
    expiresAt: Date;
  }): SessionEntity {
    const session: SessionEntity = new SessionEntity(
      args.userId,
      args.deviceId,
      args.deviceName,
      args.browserName,
      args.browserVersion,
      args.osName,
      args.ip,
      args.issuedAt,
      args.expiresAt,
      args.lastActive,
    );
    session.id = args.id;
    return session;
  }
  updateActivity() {
    this.lastActive = new Date();
  }
}
