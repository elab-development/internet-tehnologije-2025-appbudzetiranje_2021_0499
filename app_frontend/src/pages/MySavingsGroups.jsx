// src/pages/MySavingsGroups.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Container, Stack, Typography, Button, Chip,
  Card as MUICard, CardContent, CardActions, AvatarGroup, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, IconButton,
  Tabs, Tab, Divider, List, ListItem, ListItemAvatar, ListItemText,
  InputAdornment, Tooltip, Pagination
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import SearchIcon from '@mui/icons-material/Search'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import ChatIcon from '@mui/icons-material/Chat'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SendIcon from '@mui/icons-material/Send'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import axios from 'axios'

/* ---------- Layout constants ---------- */
const CARD_WIDTH = 360
const PAGE_SIZE  = 6

/* ---------- Axios base ---------- */
const API_BASE =
 process.env.REACT_APP_API_URL ||
  (typeof process !== 'undefined' && process?.env?.REACT_APP_API_URL) ||
  'http://localhost:8000/api'

const api = axios.create({ baseURL: API_BASE })
api.interceptors.request.use(cfg => {
  const t = sessionStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const PrivacyChip = ({ privacy }) => (
  <Chip
    size="small"
    icon={privacy === 'private' ? <LockIcon /> : <PublicIcon />}
    label={privacy === 'private' ? 'Private' : 'Public'}
    sx={{
      color: '#E6EEFF',
      borderColor: 'rgba(255,255,255,0.25)',
      borderWidth: 1,
      borderStyle: 'solid',
      background: 'rgba(255,255,255,0.06)'
    }}
  />
)

/* ===== tiny helpers ===== */
const getMe = () => { try { return JSON.parse(sessionStorage.getItem('user') || 'null') } catch { return null } }
const formatUserName = (u) => {
  const full = [u.name, u.surname].filter(Boolean).join(' ')
  return full || u.email || 'User'
}
const isActiveUser = (u) => {
  // accept a few common shapes
  if (u.is_active === true || u.active === true) return true
  if (typeof u.status === 'string') return u.status.toLowerCase() === 'active'
  if (u.status === 1) return true
  return false
}
const AvatarWithPresence = ({ user }) => (
  <Box sx={{ position: 'relative', display: 'inline-block' }}>
    <Avatar src={user.image || ''}>
      {(formatUserName(user)[0] || 'U').toUpperCase()}
    </Avatar>
    <Box
      sx={{
        position: 'absolute', right: -1, bottom: -1,
        width: 10, height: 10, borderRadius: '50%',
        border: '2px solid #0E1326',
        background: isActiveUser(user) ? '#22c55e' : '#ef4444'
      }}
    />
  </Box>
)

/* ==============================================================
   PAGE
================================================================ */
export default function MySavingsGroups() {
  const me   = useMemo(getMe, [])
  const myId = me?.id

  /* data */
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  /* pagination */
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(groups.length / PAGE_SIZE))
  const pagedGroups = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return groups.slice(start, start + PAGE_SIZE)
  }, [groups, page])

  /* create/edit group */
  const [openUpsert, setOpenUpsert] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', privacy: 'public', description: '' })
  const [errors, setErrors] = useState({})

  /* panel (members/chat/settings) */
  const [openPanel, setOpenPanel] = useState(false)
  const [panelTab, setPanelTab]   = useState(0)
  const [activeGroup, setActiveGroup] = useState(null)

  /* ---- user search (server-first, fallback local) ---- */
  const [query, setQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [allUsers, setAllUsers] = useState([])  // cached fallback list

  // helper: exclude yourself and users already in the group
  const visibleCandidates = (arr) => {
    const memberIds = new Set((activeGroup?.members || activeGroup?.users || []).map(u => u.id))
    return (arr || []).filter(u => u.id !== myId && !memberIds.has(u.id))
  }

  // Debounced server-side search to /users?search=...
  useEffect(() => {
    let timer
    const src = axios.CancelToken.source()

    const run = async () => {
      const q = query.trim()
      // not on Members tab or too short -> clear
      if (!openPanel || panelTab !== 0 || q.length < 2) {
        setUserResults([]); setSearching(false)
        return
      }
      setSearching(true)

      // 1) try server search
      try {
        const { data } = await api.get('/users', { params: { search: q }, cancelToken: src.token })
        const arr = data?.data ?? data
        setUserResults(visibleCandidates(arr))
        setSearching(false)
        return
      } catch (err) {
        if (axios.isCancel(err)) return
        // console fallback only, no noisy banner
        // 2) fallback — load /users once and filter locally
        try {
          if (allUsers.length === 0) {
            const { data } = await api.get('/users', { cancelToken: src.token })
            setAllUsers(data?.data ?? data)
          }
          const filtered = visibleCandidates((allUsers.length ? allUsers : []))
            .filter(u => {
              const name = [u.name, u.surname].filter(Boolean).join(' ').toLowerCase()
              return name.includes(q.toLowerCase()) || (u.email || '').toLowerCase().includes(q.toLowerCase())
            })
          setUserResults(filtered.slice(0, 25))
        } catch (e) {
          // give up silently
          setUserResults([])
        } finally {
          setSearching(false)
        }
      }
    }

    timer = setTimeout(run, 300) // debounce
    return () => { clearTimeout(timer); src.cancel('cancel search') }
  }, [query, panelTab, openPanel, activeGroup, allUsers.length]) // re-run when these change

  /* chat */
  const [messages, setMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const chatBottomRef = useRef(null)
  const scrollChatToEnd = () => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  /* ------------ data access ------------ */
  const loadGroups = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/groups')
      setGroups(data.data ?? data)
      setPage(1)
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', privacy: 'public', description: '' })
    setErrors({})
    setOpenUpsert(true)
  }
  const openEdit = (g) => {
    setEditing(g)
    setForm({ name: g.name, privacy: g.privacy, description: g.description || '' })
    setErrors({})
    setOpenUpsert(true)
  }
  const saveGroup = async () => {
    setSaving(true); setErrors({})
    try {
      if (editing) {
        const { data } = await api.patch(`/groups/${editing.id}`, form)
        setGroups((gs) => gs.map((g) => (g.id === editing.id ? (data.data ?? data) : g)))
      } else {
        const { data } = await api.post('/groups', form)
        setGroups((gs) => [data.data ?? data, ...gs])
      }
      setOpenUpsert(false)
    } catch (e) { setErrors(e.response?.data?.errors || {}) }
    finally { setSaving(false) }
  }
  const deleteGroup = async (g) => {
    if (!window.confirm(`Delete group "${g.name}"?`)) return
    await api.delete(`/groups/${g.id}`)
    setGroups((gs) => gs.filter((x) => x.id !== g.id))
    if (activeGroup?.id === g.id) setOpenPanel(false)
  }
  const joinGroup = async (g) => {
    const { data } = await api.post(`/groups/${g.id}/join`)
    setGroups((gs) => gs.map((x) => (x.id === g.id ? (data.data ?? data) : x)))
    if (activeGroup?.id === g.id) setActiveGroup(data.data ?? data)
  }
  const leaveGroup = async (g) => {
    const attempts = [
      { m: 'post', url: `/groups/${g.id}/leave` },
      { m: 'delete', url: `/groups/${g.id}/leave` },
      { m: 'delete', url: `/groups/${g.id}/members/self` },
    ]
    let updated = null
    for (const a of attempts) {
      try { const res = await api[a.m](a.url); updated = res.data?.data ?? res.data; if (updated) break } catch {}
    }
    if (!updated) return loadGroups()
    setGroups((gs) => gs.map((x) => (x.id === g.id ? updated : x)))
    if (activeGroup?.id === g.id) setActiveGroup(updated)
  }
  const openGroupPanel = async (g, initialTab = 0) => {
    setPanelTab(initialTab)
    setUserResults([]); setQuery('')
    const { data } = await api.get(`/groups/${g.id}`)
    const full = data.data ?? data
    setActiveGroup(full)
    setOpenPanel(true)
    if (initialTab === 1) loadChat(full.id)
  }

  // add member (owner-only UI)
  const addMember = async (userId) => {
    if (!activeGroup) return
    try {
      const { data } = await api.post(`/groups/${activeGroup.id}/members`, { user_id: userId })
      const updated = data.data ?? data
      setActiveGroup(updated)
      setGroups((gs) => gs.map((g) => (g.id === updated.id ? updated : g)))
      setUserResults((prev) => prev.filter(u => u.id !== userId))
    } catch (e) {
      // silent; keep UI responsive
    }
  }

  /* chat */
  const loadChat = async (groupId) => {
    setChatLoading(true)
    try {
      const { data } = await api.get(`/groups/${groupId}/messages`)
      setMessages(data.data ?? data)
      setTimeout(scrollChatToEnd, 0)
    } finally { setChatLoading(false) }
  }
  const sendMessage = async () => {
    if (!msg.trim() || !activeGroup) return
    const { data } = await api.post(`/groups/${activeGroup.id}/messages`, { message: msg.trim() })
    setMessages((m) => [...m, (data.data ?? data)])
    setMsg('')
    setTimeout(scrollChatToEnd, 0)
  }

  useEffect(() => { loadGroups() }, [])

  /* helpers */
  const isOwner    = (g) => g?.owner_id === myId
  const amMemberOf = (g) => (g?.members || g?.users || []).some(u => u.id === myId)
  const canAccess  = (g) => isOwner(g) || amMemberOf(g) // gate Members/Chat

  /* ---------- Card ---------- */
  const GroupCard = ({ g }) => {
    const members = g.members || g.users || []
    const owner   = isOwner(g)
    const member  = amMemberOf(g)

    return (
      <MUICard
        elevation={0}
        sx={{
          width: CARD_WIDTH,
          background: 'linear-gradient(180deg, rgba(20,25,50,0.7) 0%, rgba(15,20,40,0.7) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform .2s ease, box-shadow .2s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 40px rgba(0,0,0,.35)' }
        }}
      >
        <Box sx={{ height: 3, background: 'linear-gradient(90deg,#2979FF,#40C4FF)' }} />
        <CardContent sx={{ color: '#FFF', flexGrow: 1, pt: 1.5, pb: 1.5 }}>
          {/* header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              {g.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <PrivacyChip privacy={g.privacy} />
              {!owner && (
                member ? (
                  <Button size="small" onClick={() => leaveGroup(g)} startIcon={<ExitToAppIcon />} sx={{ textTransform: 'none', color: '#FFB4B4' }}>
                    Leave
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={() => joinGroup(g)}
                    startIcon={<PersonAddAlt1Icon />}
                    sx={{
                      textTransform: 'none',
                      color: '#0E1326',
                      background: 'linear-gradient(90deg,#7BD3FF,#40C4FF)',
                      '&:hover': { background: 'linear-gradient(90deg,#64C8FF,#18B6FF)' }
                    }}
                  >
                    Join
                  </Button>
                )
              )}
              {owner && (
                <>
                  <IconButton onClick={() => openEdit(g)} sx={{ color: '#BFD9FF' }} title="Edit group">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => deleteGroup(g)} sx={{ color: '#FF6B6B' }} title="Delete group">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>

          {/* description */}
          {g.description && (
            <Typography
              sx={{
                color: '#D6E4FF',
                mb: 1,
                lineHeight: 1.55,
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {g.description}
            </Typography>
          )}

          {/* avatars */}
          <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
            {(members).map((m) => (
              <Tooltip key={m.id} title={formatUserName(m)}>
                {/* small presence dot overlay on card avatars as well */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar src={m.image || ''}>
                    {(formatUserName(m)[0] || 'U').toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute', right: -1, bottom: -1,
                      width: 8, height: 8, borderRadius: '50%',
                      border: '2px solid #12172E',
                      background: isActiveUser(m) ? '#22c55e' : '#ef4444'
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </AvatarGroup>
        </CardContent>

        {/* bottom actions — only if user has access (owner or member) */}
        <CardActions sx={{ px: 1.5, pt: 0, pb: 1, gap: 1, minHeight: 56 }}>
          {canAccess(g) ? (
            <>
              <Button
                fullWidth variant="contained"
                onClick={() => openGroupPanel(g, 0)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg,#2979FF,#40C4FF)',
                  '&:hover': { background: 'linear-gradient(90deg,#1565C0,#00B0FF)' }
                }}
                startIcon={<GroupAddIcon />}
              >
                Members
              </Button>
              <Button
                fullWidth variant="outlined"
                onClick={() => openGroupPanel(g, 1)}
                startIcon={<ChatIcon />}
                sx={{
                  textTransform: 'none',
                  color: '#E6EEFF',
                  borderColor: 'rgba(255,255,255,0.25)',
                  '&:hover': { borderColor: '#40C4FF', background: 'rgba(64,196,255,0.08)' }
                }}
              >
                Chat
              </Button>
            </>
          ) : (
            // keep height consistent when actions are hidden
            <Box sx={{ height: 36, width: '100%' }} />
          )}
        </CardActions>
      </MUICard>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background:
        'radial-gradient(1200px 600px at 10% -10%, rgba(64,196,255,0.15), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(21,101,192,0.18), transparent 55%), #0D1122',
      py: 8
    }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={1.5} mb={3}>
          <Box>
            <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 800, letterSpacing: 0.2 }}>
              My Savings Groups
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              Create groups, add members, and chat with your crew.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              mt: { xs: 1.5, sm: 0 },
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(90deg,#2979FF,#40C4FF)',
              boxShadow: '0 8px 18px rgba(64,196,255,0.25)',
              '&:hover': { background: 'linear-gradient(90deg,#1565C0,#00B0FF)' }
            }}
          >
            New Group
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress color="inherit" /></Box>
        ) : groups.length === 0 ? (
          <Box sx={{
            p: 6, textAlign: 'center',
            background: 'rgba(20,25,50,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4
          }}>
            <Typography sx={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 700 }}>
              You have no groups yet.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1 }}>
              Click “New Group” to get started.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: `repeat(1, ${CARD_WIDTH}px)`, md: `repeat(3, ${CARD_WIDTH}px)` },
                justifyContent: { xs: 'center', md: 'space-between' },
                gap: 2.5
              }}
            >
              {pagedGroups.map((g) => (
                <GroupCard key={g.id} g={g} />
              ))}
            </Box>

            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                  sx={{ '& .MuiPaginationItem-root': { color: '#BFD9FF' } }}
                />
              </Box>
            )}
          </>
        )}

        {/* Create / Edit dialog */}
        <Dialog
          open={openUpsert}
          onClose={() => setOpenUpsert(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(180deg,#12172E,#0E1326)' } }}
        >
          <DialogTitle sx={{ color: '#FFF' }}>{editing ? 'Edit Group' : 'New Group'}</DialogTitle>
          <DialogContent sx={{ color: '#FFF', display: 'grid', gap: 2 }}>
            <TextField
              label="Name" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              variant="filled"
              InputLabelProps={{ sx: { color: '#AAB4CF' } }}
              InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              error={!!errors.name} helperText={errors.name?.[0]} fullWidth
            />
            <TextField
              select label="Privacy" value={form.privacy}
              onChange={(e) => setForm((f) => ({ ...f, privacy: e.target.value }))}
              variant="filled"
              InputLabelProps={{ sx: { color: '#AAB4CF' } }}
              InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              error={!!errors.privacy} helperText={errors.privacy?.[0]} fullWidth
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </TextField>
            <TextField
              label="Description" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              variant="filled" multiline rows={4}
              InputLabelProps={{ sx: { color: '#AAB4CF' } }}
              InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenUpsert(false)} sx={{ color: '#BFC8E0' }}>Cancel</Button>
            <Button
              onClick={saveGroup} disabled={saving} variant="contained"
              sx={{ textTransform: 'none', fontWeight: 700, background: 'linear-gradient(90deg,#2979FF,#40C4FF)' }}
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Group Panel */}
        <Dialog
          open={openPanel}
          onClose={() => setOpenPanel(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(180deg,#12172E,#0E1326)' } }}
        >
          <DialogTitle sx={{ color: '#FFF', pb: 0 }}>
            {activeGroup?.name}
          </DialogTitle>

          <Tabs
            value={panelTab}
            onChange={(_, v) => { setPanelTab(v); if (v === 1 && activeGroup) loadChat(activeGroup.id) }}
            sx={{
              px: 3, '& .MuiTab-root': { color: '#AAB4CF', textTransform: 'none', fontWeight: 700 },
              '& .Mui-selected': { color: '#EAF1FF' },
              '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#2979FF,#40C4FF)' }
            }}
          >
            <Tab label="Members" />
            <Tab label="Chat" />
            <Tab label="Settings" />
          </Tabs>

          <DialogContent sx={{ color: '#FFF', pt: 2 }}>
            {/* MEMBERS TAB */}
            {panelTab === 0 && (
              <>
                {/* Owner-only: search & add */}
                {activeGroup && activeGroup.owner_id === myId && (
                  <>
                    <TextField
                      placeholder="Search users by name or email…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#AAB4CF' }} />
                          </InputAdornment>
                        ),
                        sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 }
                      }}
                      fullWidth
                    />
                    {searching ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress color="inherit" size={24} />
                      </Box>
                    ) : (
                      userResults.length > 0 && (
                        <List dense sx={{ mb: 2, mt: 1, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                          {userResults.map((u) => (
                            <React.Fragment key={u.id}>
                              <ListItem
                                secondaryAction={
                                  <Button
                                    size="small"
                                    onClick={() => addMember(u.id)}
                                    sx={{
                                      textTransform: 'none',
                                      color: '#0E1326',
                                      background: 'linear-gradient(90deg,#7BD3FF,#40C4FF)',
                                      '&:hover': { background: 'linear-gradient(90deg,#64C8FF,#18B6FF)' }
                                    }}
                                  >
                                    Add
                                  </Button>
                                }
                              >
                                <ListItemAvatar>
                                  <AvatarWithPresence user={u} />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={formatUserName(u)}
                                  secondary={u.email}
                                  primaryTypographyProps={{ sx: { color: '#EAF1FF', fontWeight: 600 } }}
                                  secondaryTypographyProps={{ sx: { color: '#AAB4CF' } }}
                                />
                              </ListItem>
                              <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                            </React.Fragment>
                          ))}
                        </List>
                      )
                    )}
                  </>
                )}

                <Typography sx={{ fontWeight: 700, mb: 1, mt: 1 }}>Members</Typography>
                <List dense sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                  {(activeGroup?.members || []).map((u) => (
                    <React.Fragment key={u.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <AvatarWithPresence user={u} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={formatUserName(u)}
                          secondary={u.email}
                          primaryTypographyProps={{ sx: { color: '#EAF1FF', fontWeight: 600 } }}
                          secondaryTypographyProps={{ sx: { color: '#AAB4CF' } }}
                        />
                      </ListItem>
                      <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                    </React.Fragment>
                  ))}
                  {(activeGroup?.members || []).length === 0 && (
                    <Typography sx={{ color: '#AAB4CF', py: 2 }}>No members yet.</Typography>
                  )}
                </List>
              </>
            )}

            {/* CHAT TAB */}
            {panelTab === 1 && (
              <ChatArea
                messages={messages}
                chatLoading={chatLoading}
                msg={msg}
                setMsg={setMsg}
                sendMessage={sendMessage}
              />
            )}

            {/* SETTINGS TAB */}
            {panelTab === 2 && activeGroup && (
              activeGroup.owner_id === myId ? (
                <SettingsForm
                  activeGroup={activeGroup}
                  setActiveGroup={setActiveGroup}
                  setGroups={setGroups}
                />
              ) : (
                <Typography sx={{ color: '#AAB4CF' }}>
                  Only the group owner can update settings.
                </Typography>
              )
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  )
}

/* ---------- Chat area ---------- */
function ChatArea({ messages, chatLoading, msg, setMsg, sendMessage }) {
  const chatBottomRef = useRef(null)
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
      <Box sx={{
        flexGrow: 1, overflowY: 'auto', pr: 1,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2
      }}>
        {chatLoading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>
        ) : messages.length === 0 ? (
          <Typography sx={{ color: '#AAB4CF' }}>No messages yet. Start the conversation!</Typography>
        ) : (
          messages.map((m) => (
            <Box key={m.id} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={m.user?.image || ''} sx={{ width: 24, height: 24 }}>
                  {(m.user?.name?.[0] || 'U').toUpperCase()}
                </Avatar>
                <Typography variant="caption" sx={{ color: '#AAB4CF' }}>
                  {m.user?.name || 'User'} • {new Date(m.created_at).toLocaleString()}
                </Typography>
              </Stack>
              <Box sx={{
                mt: 0.5, p: 1.5, borderRadius: 2,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <Typography sx={{ color: '#EAF1FF' }}>{m.message}</Typography>
              </Box>
            </Box>
          ))
        )}
        <div ref={chatBottomRef} />
      </Box>

      <Stack direction="row" spacing={1.5} mt={2}>
        <TextField
          placeholder="Type a message…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          fullWidth
          InputProps={{
            sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 }
          }}
        />
        <Button
          onClick={sendMessage}
          variant="contained"
          endIcon={<SendIcon />}
          sx={{
            textTransform: 'none', fontWeight: 700,
            background: 'linear-gradient(90deg,#2979FF,#40C4FF)'
          }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  )
}

/* ---------- Settings form (owner only) ---------- */
function SettingsForm({ activeGroup, setActiveGroup, setGroups }) {
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    (typeof process !== 'undefined' && process?.env?.REACT_APP_API_URL) ||
    'http://localhost:8000/api'
  const api = axios.create({ baseURL: API_BASE })
  api.interceptors.request.use(cfg => {
    const t = sessionStorage.getItem('token')
    if (t) cfg.headers.Authorization = `Bearer ${t}`
    return cfg
  })

  return (
    <>
      <Typography sx={{ color: '#AAB4CF', mb: 2 }}>
        Update group details.
      </Typography>
      <TextField
        label="Name" defaultValue={activeGroup.name}
        onBlur={(e) => setActiveGroup((g) => ({ ...g, name: e.target.value }))}
        variant="filled" fullWidth
        InputLabelProps={{ sx: { color: '#AAB4CF' } }}
        InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
        sx={{ mb: 2 }}
      />
      <TextField
        select label="Privacy" defaultValue={activeGroup.privacy}
        onChange={(e) => setActiveGroup((g) => ({ ...g, privacy: e.target.value }))}
        variant="filled" fullWidth
        InputLabelProps={{ sx: { color: '#AAB4CF' } }}
        InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
        sx={{ mb: 2 }}
      >
        <MenuItem value="public">Public</MenuItem>
        <MenuItem value="private">Private</MenuItem>
      </TextField>
      <TextField
        label="Description" defaultValue={activeGroup.description || ''}
        onBlur={(e) => setActiveGroup((g) => ({ ...g, description: e.target.value }))}
        variant="filled" multiline rows={3} fullWidth
        InputLabelProps={{ sx: { color: '#AAB4CF' } }}
        InputProps={{ sx: { color: '#FFF', background: 'rgba(255,255,255,0.06)', borderRadius: 1 } }}
      />

      <DialogActions sx={{ px: 0, pt: 2 }}>
        <Button onClick={async () => {
          const { id, name, privacy, description } = activeGroup
          const { data } = await api.patch(`/groups/${id}`, { name, privacy, description })
          const updated = (data.data ?? data)
          setGroups((gs) => gs.map((g) => (g.id === id ? updated : g)))
          setActiveGroup(updated)
        }}
        variant="contained"
        sx={{ textTransform: 'none', fontWeight: 700, background: 'linear-gradient(90deg,#2979FF,#40C4FF)' }}>
          Save Changes
        </Button>
      </DialogActions>
    </>
  )
}
