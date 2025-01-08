import { DateTime } from 'luxon';
import { EMAIL_CONSTANTS } from '../constants';

/**
 * Validates if a timezone is supported
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    return !!DateTime.local().setZone(timezone).isValid;
  } catch {
    return false;
  }
};

/**
 * Converts a date and time from a specific timezone to UTC
 */
export const convertToUTC = (
  date: string,
  time: string,
  timezone: string = EMAIL_CONSTANTS.SCHEDULER.TIMEZONE_DEFAULT
): DateTime | null => {
  try {
    // Ensure time has seconds by appending :00 if needed
    const timeWithSeconds = time.includes(':') ? 
      (time.split(':').length === 2 ? `${time}:00` : time) : 
      `${time}:00:00`;

    console.log('Converting to UTC:', {
      input: { date, time: timeWithSeconds, timezone },
      currentUTC: DateTime.utc().toISO()
    });

    // Create DateTime object in the source timezone
    const localDateTime = DateTime.fromFormat(
      `${date} ${timeWithSeconds}`,
      'yyyy-MM-dd HH:mm:ss',
      { zone: timezone }
    );

    if (!localDateTime.isValid) {
      console.error('Invalid DateTime:', {
        reason: localDateTime.invalidReason,
        explanation: localDateTime.invalidExplanation
      });
      return null;
    }

    // Convert to UTC
    const utcDateTime = localDateTime.toUTC();
    
    console.log('Conversion result:', {
      local: {
        iso: localDateTime.toISO(),
        format: localDateTime.toFormat('yyyy-MM-dd HH:mm:ss'),
        zone: localDateTime.zoneName,
        offset: localDateTime.offset
      },
      utc: {
        iso: utcDateTime.toISO(),
        format: utcDateTime.toFormat('yyyy-MM-dd HH:mm:ss'),
        zone: utcDateTime.zoneName,
        offset: utcDateTime.offset
      }
    });

    return utcDateTime;
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return null;
  }
};

/**
 * Checks if a scheduled time is due for processing
 */
export const isScheduledTimeDue = (
  date: string,
  time: string,
  timezone: string = EMAIL_CONSTANTS.SCHEDULER.TIMEZONE_DEFAULT
): boolean => {
  try {
    // Get current time in UTC
    const nowUTC = DateTime.utc();
    
    // Convert scheduled time to UTC
    const scheduledUTC = convertToUTC(date, time, timezone);
    if (!scheduledUTC) {
      console.error('Failed to convert scheduled time to UTC');
      return false;
    }

    // Compare timestamps
    const isDue = scheduledUTC.toMillis() <= nowUTC.toMillis();
    
    console.log('Time comparison:', {
      scheduled: {
        input: { date, time, timezone },
        utc: scheduledUTC.toISO(),
        timestamp: scheduledUTC.toMillis()
      },
      current: {
        utc: nowUTC.toISO(),
        timestamp: nowUTC.toMillis()
      },
      difference: {
        milliseconds: nowUTC.toMillis() - scheduledUTC.toMillis(),
        hours: nowUTC.diff(scheduledUTC, 'hours').hours
      },
      isDue
    });

    return isDue;
  } catch (error) {
    console.error('Error in isScheduledTimeDue:', error);
    return false;
  }
};

/**
 * Formats a DateTime object to database format
 * @param dateTime - Luxon DateTime object
 * @returns Object containing date and time strings
 */
export const formatToDBDateTime = (dateTime: DateTime) => ({
  date: dateTime.toFormat('yyyy-MM-dd'),
  time: dateTime.toFormat('HH:mm'),
});
