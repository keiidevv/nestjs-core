import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';

@Entity()
export class Movie extends BaseTable {
  // 그대로 컬럼을 상속받아서 사용 가능
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // 유니크 제약조건 추가
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable() // 중간 테이블 생성 (한 쪽에만 존재)
  genres: Genre[];

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // 연관관계 자동 생성 (함께 업데이트 가능)
    nullable: false, // 필수값으로 지정
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false, // 필수값으로 지정
  })
  director: Director;
}
