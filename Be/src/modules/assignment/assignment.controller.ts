import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ScoreSubmissionDto } from './dto/score-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../../prisma/generated-client/client';
import { memoryStorage } from 'multer';

@ApiTags('Assignment')
@ApiBearerAuth('JWT-auth')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // --- Assignment Management ---

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Admin: Create new assignment',
    description:
      'Creates a new recruitment assignment for a specific sub-division. ' +
      'Admins can optionally upload a file (e.g., PDF instructions or templates) which will be stored on Cloudinary.',
  })
  @ApiResponse({ status: 201, description: 'Assignment successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() dto: CreateAssignmentDto,
    @GetUser('id') adminId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentService.create(dto, adminId, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all assignments (Admin) or user assignments (User)',
    description:
      'Admins receive all assignments in the system. ' +
      'Regular users receive only assignments for their chosen sub-division, provided they have submitted their exam.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments successfully retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    if (role === UserRole.ADMIN) {
      return this.assignmentService.findAll();
    }
    return this.assignmentService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single assignment details',
    description:
      'Retrieves the full details of an assignment, including its file URL and sub-division information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment successfully retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Admin: Update assignment',
    description:
      'Updates an existing assignment. If a new file is uploaded, it will replace the previous one on Cloudinary.',
  })
  @ApiResponse({ status: 200, description: 'Assignment successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentService.update(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Delete assignment' })
  @ApiResponse({ status: 200, description: 'Assignment successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id);
  }

  // --- Submissions ---

  @Post(':id/submit')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit assignment' })
  @ApiResponse({
    status: 201,
    description: 'Assignment successfully submitted',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The assignment submission file',
        },
        textContent: {
          type: 'string',
          description: 'Text content for assignment submission',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  submit(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: SubmitAssignmentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.assignmentService.submit(id, userId, file, dto.textContent);
  }

  @Get(':id/submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all submissions for an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Submissions successfully retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  getSubmissions(@Param('id') id: string) {
    return this.assignmentService.getSubmissions(id);
  }

  @Patch('submissions/:submissionId/score')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Score a submission' })
  @ApiResponse({ status: 200, description: 'Submission successfully scored' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  scoreSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: ScoreSubmissionDto,
  ) {
    return this.assignmentService.scoreSubmission(submissionId, dto);
  }
}


