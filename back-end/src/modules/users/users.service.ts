import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore, User } from '../../store/data.store';
import { normalizeRole } from '../../common/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto';
import { hashPassword } from '../../common/password.util';

function ageFromDate(dateString?: string) {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (!Number.isFinite(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DataStore) {}

  private actor(actorId?:string){ return actorId ? this.db.getUser(actorId) : null; }
  private enforceAdminUserScope(actorId?:string){
    const actor=this.actor(actorId);
    if(actor?.role==='admin' && actor.adminTeam!=='USER_ADMIN') throw new ForbiddenException('User management belongs to User Admin.');
    return actor;
  }

  findAll(actorId?:string){ this.enforceAdminUserScope(actorId); return this.db.users.map(u => this.db.safeUser(u)); }

  findByRole(role: string,actorId?:string) {
    this.enforceAdminUserScope(actorId);
    const normalized = normalizeRole(role);
    if (!normalized) throw new BadRequestException('Invalid role.');
    return this.db.users.filter(u => u.role === normalized).map(u => this.db.safeUser(u));
  }

  findOne(id:string){
    const user = this.db.getUser(id);
    if (!user) throw new NotFoundException('User not found.');
    return this.db.safeUser(user);
  }

  create(dto:CreateUserDto, publicRegistration = false, actorId?:string){
    const role = normalizeRole(dto.role);
    if (!role) throw new BadRequestException('Invalid role.');
    // IndAI has exactly one provisioned Super Admin. Runtime/public creation of another Super Admin is never allowed.
    if (role === 'superuser') throw new ForbiddenException('IndAI has a single protected Super Admin account. Another Super Admin cannot be created.');
    if (publicRegistration && !dto.phone) throw new BadRequestException('Phone number is required for public registration.');
    if (publicRegistration && !dto.dateOfBirth) throw new BadRequestException('Date of Birth is required for public registration.');
    if (!publicRegistration && role !== 'admin') {
      const actor=this.actor(actorId);
      if(!actor || !['superuser','admin'].includes(actor.role)) throw new ForbiddenException('User Admin or Super Admin access required to create users.');
      if(actor.role==='admin' && actor.adminTeam!=='USER_ADMIN') throw new ForbiddenException('User creation belongs to User Admin.');
    }
    const normalizedEmail = dto.email.toLowerCase().trim();
    if (this.db.findUserByEmail(normalizedEmail)) throw new ConflictException('Email already registered.');
    if ((dto as any).confirmPassword && (dto as any).confirmPassword !== dto.password) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (dto.dateOfBirth && ageFromDate(dto.dateOfBirth)! < 10) {
      throw new BadRequestException('You must be at least 10 years old.');
    }

    if (role === 'learner') {
      if (dto.institution && !dto.studentId) throw new BadRequestException('Student ID is required when an institution is provided.');
      if (dto.studentId && !dto.institution) throw new BadRequestException('Institution is required when a Student ID is provided.');
      if (dto.institution && dto.studentId) {
        const institution = dto.institution.trim().toLowerCase();
        const studentId = dto.studentId.trim().toLowerCase();
        const duplicateStudent = this.db.users.some(u => u.role === 'learner' && String((u as any).institution || '').trim().toLowerCase() === institution && String((u as any).studentId || '').trim().toLowerCase() === studentId);
        if (duplicateStudent) throw new ConflictException('Student ID already exists for this institution.');
      }
    }

    if (role === 'instructor') {
      if (!dto.institution) throw new BadRequestException('Institution / Organization is required for instructors.');
      if (!dto.expertise) throw new BadRequestException('Expertise / Specialization is required for instructors.');
      if (!dto.yearsExp && !(dto as any).yearsOfExperience) throw new BadRequestException('Years of experience is required for instructors.');
    }

    if (role === 'provider') {
      if (!dto.organization) throw new BadRequestException('Organization name is required for course providers.');
      if (publicRegistration && !dto.contentType) throw new BadRequestException('Content type is required for course providers.');
    }

    if (role === 'admin') {
      if (!dto.adminTeam || !['USER_ADMIN','PAYMENT_ADMIN'].includes(dto.adminTeam)) throw new BadRequestException('Choose USER_ADMIN or PAYMENT_ADMIN for the admin request.');
      if (publicRegistration) {
        const expectedCode = String(process.env.ADMIN_REGISTRATION_CODE || 'ADMIN2024').trim();
        if (!dto.authCode || String(dto.authCode).trim() !== expectedCode) {
          throw new ForbiddenException('Invalid Admin authorization code.');
        }
      } else {
        const actor=actorId?this.db.getUser(actorId):null;
        if (!actor || actor.role !== 'superuser') throw new ForbiddenException('Only Super Admin can directly create User Admin or Payment Admin accounts.');
      }
    }

    if (dto.instructorId) {
      const instructor = this.db.getUser(dto.instructorId);
      if (!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
    }

    const startingBalance = dto.startingBalance ?? (role === 'learner' ? 100000 : 0);
    const { confirmPassword, authCode: _authCode, role: _rawRole, status: _rawStatus, password: _rawPassword, firstName: _rawFirstName, lastName: _rawLastName, email: _rawEmail, ...profileDto } = dto as any;
    const user: User = {
      ...profileDto,
      id: this.db.id('u'),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: normalizedEmail,
      password: hashPassword(dto.password),
      role,
      status: String(publicRegistration && ['instructor','provider','admin'].includes(role) ? 'pending' : (dto.status || (role === 'provider' ? 'pending' : 'active'))).toLowerCase(),
      skillPoints: Number(dto.skillPoints || 0),
      startingBalance,
      virtualBalance: dto.virtualBalance ?? startingBalance,
      portfolioValue: dto.portfolioValue ?? startingBalance,
      tradingLimit: dto.tradingLimit ?? (role === 'learner' ? Number(this.db.config.defaultTradingLimit||150000) : 0),
      instructorId: dto.instructorId,
      organization: dto.organization,
      expertise: dto.expertise,
      learnerLevel: (dto as any).experienceLevel || dto.tradingExperience || (dto as any).experience,
      providerVerified: role === 'provider' ? false : undefined,
      subscriptionTier: role === 'learner' ? 'FREE' : undefined,
      adminTeam: role === 'admin' ? dto.adminTeam : undefined,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(user);
    this.db.audit('USER_CREATED',actorId||user.id,{targetUserId:user.id,role:user.role,adminTeam:user.adminTeam||null,publicRegistration});
    return this.db.safeUser(user);
  }

  update(id:string,dto:UpdateUserDto,actorId?:string){
    const user = this.db.getUser(id);
    if(!user) throw new NotFoundException('User not found.');
    const actor=actorId?this.db.getUser(actorId):null;
    if(actor?.role==='admin' && actor.adminTeam!=='USER_ADMIN') throw new ForbiddenException('User updates belong to User Admin.');
    if(user.role==='admin' && actor?.role!=='superuser') throw new ForbiddenException('Only Super Admin can modify admin-team accounts.');
    if(dto.adminTeam!==undefined && actor?.role!=='superuser') throw new ForbiddenException('Only Super Admin can change an admin division.');
    if(dto.providerVerified!==undefined && !actor) throw new ForbiddenException('User Admin or Super Admin identity is required for provider verification.');
    if(dto.providerVerified!==undefined && !(actor.role==='superuser' || (actor.role==='admin'&&actor.adminTeam==='USER_ADMIN'))) throw new ForbiddenException('Provider verification belongs to User Admin or Super Admin.');
    if(user.role==='provider' && dto.status==='active' && user.status!=='active' && actor?.role!=='superuser') throw new ForbiddenException('Super Admin must approve the provider account before activation.');
    if(user.role==='provider' && dto.providerVerified===true && user.status!=='active') throw new ForbiddenException('Provider account must be approved and active before verification.');
    if (dto.email) {
      const existing = this.db.findUserByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email already registered.');
      dto.email = dto.email.toLowerCase().trim();
    }
    if (dto.instructorId) {
      const instructor = this.db.getUser(dto.instructorId);
      if (!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
    }
    if(user.role==='learner'&&(dto.studentId!==undefined||(dto.institution!==undefined&&dto.institution!==user.institution))){
      const institution=(dto.institution??user.institution??'').trim().toLowerCase(),studentId=(dto.studentId??user.studentId??'').trim().toLowerCase();
      if(Boolean(institution)!==Boolean(studentId))throw new BadRequestException('Institution and Student ID must be provided together.');
      if(institution&&this.db.users.some(other=>other.id!==id&&other.role==='learner'&&String(other.institution||'').trim().toLowerCase()===institution&&String(other.studentId||'').trim().toLowerCase()===studentId))throw new ConflictException('Student ID already exists in this institution.');
    }
    Object.assign(user,dto);
    this.db.audit('USER_UPDATED',actorId,{targetUserId:id,fields:Object.keys(dto)});
    return this.db.safeUser(user);
  }

  remove(id:string,actorId?:string){
    const idx = this.db.users.findIndex(u=>u.id===id);
    if(idx === -1) throw new NotFoundException('User not found.');
    const target=this.db.users[idx]; const actor=this.actor(actorId);
    if(!actor || !['superuser','admin'].includes(actor.role)) throw new ForbiddenException('User Admin or Super Admin access required.');
    if(target.role==='superuser') throw new ForbiddenException('Super Admin cannot be deleted through this endpoint.');
    if(target.role==='admin' && actor.role!=='superuser') throw new ForbiddenException('Only Super Admin can delete admin-team accounts.');
    if(actor.role==='admin' && actor.adminTeam!=='USER_ADMIN') throw new ForbiddenException('User deletion belongs to User Admin.');
    this.db.users.splice(idx,1);
    this.db.audit('USER_DELETED',actorId,{targetUserId:id,role:target.role,adminTeam:target.adminTeam||null});
    return { id };
  }

  portfolio(id:string){
    const portfolio = this.db.refreshPortfolio(id);
    if (!portfolio) throw new NotFoundException('Learner not found.');
    return portfolio;
  }
}
