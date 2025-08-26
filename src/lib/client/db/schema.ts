import { type } from "arktype";

/**
 * User roles within the application
 */
export enum UserRole {
	Admin = "admin", // Full access to all features
	Moderator = "moderator", // Can manage sloths and sightings, but not users
	User = "user",
}

/**
 * Status of a sloth in the wild
 */
export enum SlothStatus {
	Active = "active",
	Removed = "removed",
}
export const SlothStatusSchema = type.valueOf(SlothStatus);

/**
 * Types of content that can be reported
 */
export enum ContentType {
	Sloth = "sloth",
	Sighting = "sighting",
	Photo = "photo",
}
export const ContentTypeSchema = type.valueOf(ContentType);

/**
 * Report reasons for content moderation
 */
export enum ReportReason {
	Inappropriate = "inappropriate",
	Spam = "spam",
	FakeLocation = "fake_location",
	NotASloth = "not_a_sloth",
	Duplicate = "duplicate",
	InappropriateImage = "inappropriate_image",
	OffensiveContent = "offensive_content",
	Other = "other",
}
export const ReportReasonSchema = type.valueOf(ReportReason);

export enum ModerationReportStatus {
	Open = "open",
	Resolved = "resolved",
}

export enum ModerationActionType {
	RemoveContent = "remove_content",
	RestoreContent = "restore_content",
	WarnUser = "warn_user",
	BanUser = "ban_user",
	UnbanUser = "unban_user",
	MergeContent = "merge_content",
}
export const ModerationActionTypeSchema = type.valueOf(ModerationActionType);
