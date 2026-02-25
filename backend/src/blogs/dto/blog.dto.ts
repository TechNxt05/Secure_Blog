import {
    IsString,
    IsBoolean,
    IsOptional,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateBlogDto {
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title!: string;

    @IsString()
    @MinLength(10)
    content!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    summary?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class UpdateBlogDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    content?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    summary?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
