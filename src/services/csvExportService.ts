import { supabase } from '@/integrations/supabase/client';

interface FormResponse {
  id: string;
  participant_email: string;
  participant_name: string | null;
  response_data: Record<string, any>;
  submitted_at: string;
}

export const exportFormResponsesToCSV = async (studyId: string, studyTitle: string): Promise<void> => {
  try {
    const { data: responses, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('study_id', studyId)
      .order('submitted_at', { ascending: true });

    if (error) throw error;

    if (!responses || responses.length === 0) {
      throw new Error('No responses found for this study');
    }

    const allFields = new Set<string>();
    allFields.add('Response ID');
    allFields.add('Participant Name');
    allFields.add('Participant Email');
    allFields.add('Submitted At');

    responses.forEach((response: FormResponse) => {
      if (response.response_data && typeof response.response_data === 'object') {
        Object.keys(response.response_data).forEach(key => allFields.add(key));
      }
    });

    const headers = Array.from(allFields);
    const csvRows: string[] = [];

    csvRows.push(headers.map(header => `"${header}"`).join(','));

    responses.forEach((response: FormResponse) => {
      const row: string[] = [];

      headers.forEach(header => {
        let value = '';

        if (header === 'Response ID') {
          value = response.id;
        } else if (header === 'Participant Name') {
          value = response.participant_name || '';
        } else if (header === 'Participant Email') {
          value = response.participant_email || '';
        } else if (header === 'Submitted At') {
          value = new Date(response.submitted_at).toLocaleString();
        } else {
          const responseData = response.response_data || {};
          value = responseData[header] !== undefined ? String(responseData[header]) : '';
        }

        value = value.replace(/"/g, '""');
        row.push(`"${value}"`);
      });

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const sanitizedTitle = studyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedTitle}_responses_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

export const getResponseCount = async (studyId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', studyId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting response count:', error);
    return 0;
  }
};
