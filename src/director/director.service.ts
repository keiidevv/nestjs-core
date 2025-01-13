import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorRepository.save(createDirectorDto);
  }

  findAll() {
    return this.directorRepository.find();
  }

  findOne(id: string) {
    return this.directorRepository.findOne({ where: { id: id } });
  }

  async update(id: string, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOne({
      where: { id: id },
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }

    await this.directorRepository.update(id, updateDirectorDto);
    return this.directorRepository.findOne({ where: { id: id } });
  }

  async remove(id: string) {
    const director = await this.directorRepository.findOne({
      where: { id: id },
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }
    return this.directorRepository.delete(id);
  }
}
