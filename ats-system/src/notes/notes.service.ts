import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    return this.prisma.note.create({
      data: createNoteDto,
    });
  }

  async findAll(): Promise<Note[]> {
    return this.prisma.note.findMany({
      include: {
        candidate: true,
        application: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        candidate: true,
        application: true,
      },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    try {
      return await this.prisma.note.update({
        where: { id },
        data: updateNoteDto,
      });
    } catch (error) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<Note> {
    try {
      return await this.prisma.note.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
  }

  async findByCandidate(candidateId: number): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { candidateId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByApplication(applicationId: number): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { applicationId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
