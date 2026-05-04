import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataStore, User } from '../../store/data.store';
import { normalizeRole } from '../../common/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto';

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

  findAll(){ return this.db.users.map(u => this.db.safeUser(u)); }

  findByRole(role: string) {
    const normalized = normalizeRole(role);
    if (!normalized) throw new BadRequestException('Invalid role.');
    return this.db.users.filter(u => u.role === normalized).map(u => this.db.safeUser(u));
  }

  findOne(id:string){
    const user = this.db.getUser(id);
    if (!user) throw new NotFoundException('User not found.');
    return this.db.safeUser(user);
  }

  create(dto:CreateUserDto){
    const role = normalizeRole(dto.role);
    if (!role) throw new BadRequestException('Invalid role.');
    const normalizedEmail = dto.email.toLowerCase().trim();
    if (this.db.findUserByEmail(normalizedEmail)) throw new ConflictException('Email already registered.');
    if ((dto as any).confirmPassword && (dto as any).confirmPassword !== dto.password) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (dto.dateOfBirth && ageFromDate(dto.dateOfBirth)! < 10) {
      throw new BadRequestException('You must be at least 10 years old.');
    }

    if (role === 'learner') {
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
    }

    if (role === 'admin') {
      if (!dto.institution) throw new BadRequestException('Institution is required for admins.');
      if (!dto.authCode) throw new BadRequestException('Authorization code is required.');
      if (!dto.accessLevel) throw new BadRequestException('Admin access level is required.');
    }

    if (dto.instructorId) {
      const instructor = this.db.getUser(dto.instructorId);
      if (!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
    }

    const startingBalance = dto.startingBalance ?? (role === 'learner' ? 100000 : 0);
    const { confirmPassword, role: _rawRole, status: _rawStatus, password: _rawPassword, firstName: _rawFirstName, lastName: _rawLastName, email: _rawEmail, ...profileDto } = dto as any;
    const user: User = {
      ...profileDto,
      id: this.db.id('u'),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: normalizedEmail,
      password: dto.password,
      role,
      status: String(dto.status || 'active').toLowerCase(),
      skillPoints: Number(dto.skillPoints || 0),
      startingBalance,
      virtualBalance: dto.virtualBalance ?? startingBalance,
      portfolioValue: dto.portfolioValue ?? startingBalance,
      tradingLimit: dto.tradingLimit ?? (role === 'learner' ? 150000 : 0),
      instructorId: dto.instructorId,
      organization: dto.organization,
      expertise: dto.expertise,
      learnerLevel: (dto as any).experienceLevel || dto.tradingExperience || (dto as any).experience,
    };
    this.db.users.push(user);
    return this.db.safeUser(user);
  }

  update(id:string,dto:UpdateUserDto){
    const user = this.db.getUser(id);
    if(!user) throw new NotFoundException('User not found.');
    if (dto.email) {
      const existing = this.db.findUserByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email already registered.');
      dto.email = dto.email.toLowerCase().trim();
    }
    if (dto.instructorId) {
      const instructor = this.db.getUser(dto.instructorId);
      if (!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
    }
    Object.assign(user,dto);
    return this.db.safeUser(user);
  }

  remove(id:string){
    const idx = this.db.users.findIndex(u=>u.id===id);
    if(idx === -1) throw new NotFoundException('User not found.');
    this.db.users.splice(idx,1);
    return { id };
  }

  portfolio(id:string){
    const portfolio = this.db.refreshPortfolio(id);
    if (!portfolio) throw new NotFoundException('Learner not found.');
    return portfolio;
  }
}
