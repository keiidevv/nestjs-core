import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude() // 한번에 전체 적용 가능 (보안을 위해 외부 노출을 하지 않는 경우)
export class Movie {
  @Expose({ name: 'id' }) // 디폴트 Exclude 인 경우 Expose를 사용
  id: number;

  @Expose({ name: '영화 제목' })
  title: string;

  @Exclude() // serialize 과정에서 제외
  test: string;

  @Transform(({ value }) => value.toUpperCase()) // 특정 속성에 대해 변환 적용
  genre: string;
}
