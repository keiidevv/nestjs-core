import { PartialType } from '@nestjs/swagger';
import { CreateMovieDto } from './create-movie.dto';
import {
  Contains,
  Equals,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsCreditCard,
  IsDate,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsFQDN,
  IsHexColor,
  IsIn,
  IsInt,
  IsLatLong,
  IsNegative,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotContains,
  NotEquals,
  registerDecorator,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

enum MovieGenre {
  ACTION = 'action',
  COMEDY = 'comedy',
  HORROR = 'horror',
  ROMANCE = 'romance',
}

// 커스텀 validator 등록 방법
@ValidatorConstraint({ name: 'password', async: true }) // 비동기 검증 가능
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments: ValidationArguments,
  ): Promise<boolean> | boolean {
    // 비밀번호 길이는 4~8
    return value.length >= 4 && value.length <= 8;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return `비밀번호 길이는 4~8자 이어야 합니다. 입력된 비밀번호: ${validationArguments.value}`;
  }
}

// 커스텀 validator 등록 방법 2
function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordValidator, // 위에 선언한 커스텀 validator를 사용할 것으로 등록
    });
  };
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  detail?: string;
}

export class TestDto {
  /**
   * 기본 Validator
   */
  @IsDefined() // null || undefined 아니면 통과
  @Equals('test') // 값이 test면 통과
  @NotEquals('Test') // 값이 Test가 아니면 통과
  @IsEmpty() // null || undefined || ''(empty string) 값이 비어있으면 통과
  @IsNotEmpty() // null || undefined || ''(empty string) 값이 비어있으면 통과
  @IsIn(['test', 'test2']) // 값이 test 또는 test2면 통과, 1회성으로 쓴다
  basic: string;

  /**
   * 타입 Validator
   */
  @IsString() // 문자열이면 통과 -> 가장 많이 쓴다
  @IsBoolean() // 불리언이면 통과
  @IsNumber() // 숫자이면 통과
  @IsInt() // 정수이면 통과
  @IsArray() // 배열이면 통과
  @IsEnum(MovieGenre) // 열거형이면 통과
  @IsDate() // 날짜이면 통과
  @IsDateString() // 날짜 문자열(ISO8601)이면 통과
  type: string;

  /**
   * 숫자 Validator
   */
  @IsDivisibleBy(10) // 10으로 나누어 떨어지면 통과
  @IsPositive() // 양수이면 통과
  @IsNegative() // 음수이면 통과
  @Min(100) // 최소값이 100이면 통과 -> 자주 쓰임
  @Max(100) // 최대값이 100이면 통과 -> 자주 쓰임
  number: number;

  /**
   * 문자열 Validator
   */
  @Contains('test') // 문자열에 test가 포함되어 있으면 통과
  @NotContains('test') // 문자열에 test가 포함되어 있지 않으면 통과
  @IsAlphanumeric() // 알파벳 또는 숫자이면 통과 -> 자주 쓰임
  @IsCreditCard() // 신용카드 번호이면 통과 (ex. 5312-1234-1234-1234)
  @IsHexColor() // 16진수 색상이면 통과 (ex. #000000)
  @MinLength(10) // 최소 길이가 10이면 통과, 비밀번호 생성 시에 유용
  @MaxLength(10) // 최대 길이가 10이면 통과, 비밀번호 생성 시에 유용
  @IsUUID() // UUID이면 통과
  @IsLatLong() // 위도와 경도이면 통과
  @IsEmail() // 이메일이면 통과
  @IsFQDN() // 정규화된 도메인 이름이면 통과
  @IsUrl() // URL이면 통과
  string: string;

  @Validate(PasswordValidator, { message: '메세지 오버라이드 가능' })
  @IsPasswordValid() // 직접 만들어서 사용할 수 있음 -> 해당 기능은 매번 검증을 하는 조건들이 늘어날 경우에 유용하게 사용 가능
  password: string;
}
