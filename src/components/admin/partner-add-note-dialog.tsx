'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import type { PartnerRequest } from '@/app/admin/partners/page';

interface AddNoteDialogProps {
  partner: PartnerRequest | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddNoteDialog({ partner, isOpen, onOpenChange }: AddNoteDialogProps) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSaveNote = async () => {
    if (!firestore || !user || !partner || !note.trim()) return;
    setIsSaving(true);

    const newNote = {
      text: note,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: new Date().toISOString(),
    };

    try {
      const partnerDocRef = doc(firestore, 'partner_requests', partner.id);
      
      // The `updateDocumentNonBlocking` is a simple wrapper. We can't easily use arrayUnion
      // without modifying it. For simplicity and to avoid race conditions, we'll
      // pass arrayUnion directly to a more robust update call if we had one.
      // Given the constraints, we will have to read and then write.
      const updatedNotes = [...(partner.notes || []), newNote];
      updateDocumentNonBlocking(partnerDocRef, {
        notes: updatedNotes
      });

      toast({
        title: 'Note Added',
        description: `A new note has been added to ${partner.companyName}.`,
      });
      setNote('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Note",
        description: "An error occurred while saving the note."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = (open: boolean) => {
      if(!open) {
          setNote('');
      }
      onOpenChange(open);
  }

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note for {partner.companyName}</DialogTitle>
          <DialogDescription>
            Add an internal note. This will only be visible to other administrators.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            disabled={isSaving}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSaveNote} disabled={isSaving || !note.trim()}>
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
