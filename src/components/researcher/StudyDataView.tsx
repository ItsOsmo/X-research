import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataUploadDialog } from './DataUploadDialog';
import {
  Upload,
  Download,
  FileText,
  Calendar,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface StudyDataViewProps {
  studyId: string;
  studyTitle: string;
}

interface DataUpload {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  row_count: number | null;
  description: string | null;
}

export const StudyDataView = ({ studyId, studyTitle }: StudyDataViewProps) => {
  const [uploads, setUploads] = useState<DataUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<DataUpload | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUploads();
  }, [studyId]);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_data_uploads')
        .select('*')
        .eq('study_id', studyId)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setUploads(data || []);
    } catch (err: any) {
      console.error('Error loading uploads:', err);
      toast({
        title: 'Error loading data',
        description: 'Failed to load uploaded files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (upload: DataUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from('study-data')
        .download(upload.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `Downloading ${upload.file_name}`
      });
    } catch (err: any) {
      console.error('Download error:', err);
      toast({
        title: 'Download failed',
        description: err.message || 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const confirmDelete = (upload: DataUpload) => {
    setUploadToDelete(upload);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!uploadToDelete) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('study-data')
        .remove([uploadToDelete.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('study_data_uploads')
        .delete()
        .eq('id', uploadToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: 'File deleted',
        description: `${uploadToDelete.file_name} has been deleted`
      });

      loadUploads();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: 'Delete failed',
        description: err.message || 'Failed to delete file',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setUploadToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Participant Data</CardTitle>
              <CardDescription>
                CSV files containing data collected from participants
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload CSV files containing participant responses and data
              </p>
              <Button
                onClick={() => setShowUploadDialog(true)}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{upload.file_name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{formatFileSize(upload.file_size)}</span>
                          {upload.row_count !== null && (
                            <>
                              <span>•</span>
                              <span>{upload.row_count} rows</span>
                            </>
                          )}
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(upload.upload_date)}
                          </div>
                        </div>
                        {upload.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {upload.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(upload)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(upload)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DataUploadDialog
        studyId={studyId}
        studyTitle={studyTitle}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadSuccess={loadUploads}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{uploadToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
